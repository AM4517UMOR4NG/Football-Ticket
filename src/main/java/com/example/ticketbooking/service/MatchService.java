package com.example.ticketbooking.service;

import com.example.ticketbooking.entity.Match;
import com.example.ticketbooking.entity.MatchStatus;
import com.example.ticketbooking.entity.MatchCategory;
import com.example.ticketbooking.repository.MatchRepository;
import com.example.ticketbooking.exception.MatchNotFoundException;
import com.example.ticketbooking.exception.BookingNotAllowedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MatchService {
    
    @Autowired
    private MatchRepository matchRepository;
    
    // CRUD Operations
    public Match createMatch(Match match, String createdBy) {
        match.setCreatedBy(createdBy);
        match.setStatus(MatchStatus.SCHEDULED);
        validateMatchRules(match);
        return matchRepository.save(match);
    }
    
    public Match updateMatch(Long id, Match matchDetails, String updatedBy) {
        Match match = findMatchById(id);
        
        // Update fields
        match.setMatchName(matchDetails.getMatchName());
        match.setHomeTeam(matchDetails.getHomeTeam());
        match.setAwayTeam(matchDetails.getAwayTeam());
        match.setMatchDate(matchDetails.getMatchDate());
        match.setVenue(matchDetails.getVenue());
        match.setTicketPrice(matchDetails.getTicketPrice());
        match.setCapacity(matchDetails.getCapacity());
        match.setCategory(matchDetails.getCategory());
        match.setDescription(matchDetails.getDescription());
        match.setMinAge(matchDetails.getMinAge());
        match.setMaxTicketsPerUser(matchDetails.getMaxTicketsPerUser());
        match.setRefundAllowed(matchDetails.getRefundAllowed());
        
        validateMatchRules(match);
        return matchRepository.save(match);
    }
    
    public void deleteMatch(Long id) {
        Match match = findMatchById(id);
        if (match.getTicketsSold() > 0) {
            throw new BookingNotAllowedException("Tidak dapat menghapus pertandingan yang sudah memiliki penjualan tiket");
        }
        matchRepository.delete(match);
    }
    
    public Match findMatchById(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new MatchNotFoundException("Pertandingan dengan ID " + id + " tidak ditemukan"));
    }
    
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }
    
    // Business Logic Methods
    public List<Match> getUpcomingMatches() {
        return matchRepository.findUpcomingMatches(LocalDateTime.now());
    }
    
    public List<Match> getMatchesOpenForBooking() {
        return matchRepository.findOpenForBooking(LocalDateTime.now());
    }
    
    public List<Match> getMatchesByCategory(MatchCategory category) {
        return matchRepository.findByCategory(category);
    }
    
    public List<Match> getMatchesByStatus(MatchStatus status) {
        return matchRepository.findByStatus(status);
    }
    
    public List<Match> searchMatches(String matchName, String homeTeam, String awayTeam, 
                                   String venue, MatchCategory category, MatchStatus status) {
        return matchRepository.searchMatches(matchName, homeTeam, awayTeam, venue, category, status);
    }
    
    public List<Match> getPopularMatches() {
        return matchRepository.findPopularMatches(0.5); // 50% booking rate
    }
    
    public List<Match> getMatchesByCreator(String createdBy) {
        return matchRepository.findByCreatedByOrderByCreatedAtDesc(createdBy);
    }
    
    // Booking Related Methods
    public boolean canBookTickets(Long matchId, Integer requestedTickets, Integer userAge) {
        Match match = findMatchById(matchId);
        
        // Check all booking rules
        if (!match.isBookingOpen()) {
            return false;
        }
        
        if (userAge != null && userAge < match.getMinAge()) {
            return false;
        }
        
        return match.canBookTickets(requestedTickets);
    }
    
    public Match bookTickets(Long matchId, Integer ticketCount, String userName) {
        Match match = findMatchById(matchId);
        
        if (!match.canBookTickets(ticketCount)) {
            throw new BookingNotAllowedException("Tidak dapat memesan tiket untuk pertandingan ini");
        }
        
        // Update tickets sold
        match.setTicketsSold(match.getTicketsSold() + ticketCount);
        
        // Check if match is sold out
        if (match.getTicketsSold().equals(match.getCapacity())) {
            // You might want to set a different status or send notification
        }
        
        return matchRepository.save(match);
    }
    
    public Match cancelTickets(Long matchId, Integer ticketCount) {
        Match match = findMatchById(matchId);
        
        if (!match.isRefundAllowed()) {
            throw new BookingNotAllowedException("Refund tidak diizinkan untuk pertandingan ini");
        }
        
        if (match.getTicketsSold() < ticketCount) {
            throw new BookingNotAllowedException("Jumlah tiket yang dibatalkan melebihi tiket yang terjual");
        }
        
        match.setTicketsSold(match.getTicketsSold() - ticketCount);
        return matchRepository.save(match);
    }
    
    // Status Management
    public Match updateMatchStatus(Long id, MatchStatus status) {
        Match match = findMatchById(id);
        match.setStatus(status);
        return matchRepository.save(match);
    }
    
    public Match startMatch(Long id) {
        return updateMatchStatus(id, MatchStatus.LIVE);
    }
    
    public Match finishMatch(Long id) {
        return updateMatchStatus(id, MatchStatus.FINISHED);
    }
    
    public Match cancelMatch(Long id) {
        Match match = findMatchById(id);
        match.setStatus(MatchStatus.CANCELLED);
        // Here you might want to trigger refund process for all tickets
        return matchRepository.save(match);
    }
    
    public Match postponeMatch(Long id, LocalDateTime newDate) {
        Match match = findMatchById(id);
        match.setStatus(MatchStatus.POSTPONED);
        match.setMatchDate(newDate);
        return matchRepository.save(match);
    }
    
    // Statistics and Analytics
    public long getTotalMatches() {
        return matchRepository.count();
    }
    
    public long getScheduledMatchesCount() {
        return matchRepository.countScheduledMatches();
    }
    
    public long getMatchCountByStatus(MatchStatus status) {
        return matchRepository.countByStatus(status);
    }
    
    public long getMatchCountByCategory(MatchCategory category) {
        return matchRepository.countByCategory(category);
    }
    
    public Long getTotalTicketsSold() {
        Long total = matchRepository.getTotalTicketsSold();
        return total != null ? total : 0L;
    }
    
    public Double getAverageTicketPrice() {
        Double average = matchRepository.getAverageTicketPrice();
        return average != null ? average : 0.0;
    }
    
    // Rule Validation
    private void validateMatchRules(Match match) {
        // Validate basic rules
        if (match.getMatchDate().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new IllegalArgumentException("Pertandingan harus dijadwalkan minimal 24 jam dari sekarang");
        }
        
        if (match.getBookingDeadline().isAfter(match.getMatchDate())) {
            throw new IllegalArgumentException("Batas waktu booking tidak boleh setelah waktu pertandingan");
        }
        
        if (match.getRefundDeadline() != null && match.getRefundDeadline().isAfter(match.getMatchDate())) {
            throw new IllegalArgumentException("Batas waktu refund tidak boleh setelah waktu pertandingan");
        }
        
        if (match.getHomeTeam().equalsIgnoreCase(match.getAwayTeam())) {
            throw new IllegalArgumentException("Tim tuan rumah dan tim tamu tidak boleh sama");
        }
        
        if (match.getMaxTicketsPerUser() > 10) {
            throw new IllegalArgumentException("Maksimal tiket per user tidak boleh lebih dari 10");
        }
        
        if (match.getMinAge() > 21) {
            throw new IllegalArgumentException("Batas umur minimal tidak boleh lebih dari 21 tahun");
        }
    }
    
    // Admin specific methods
    public List<Match> getMatchesNeedingAttention() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime alertTime = now.plusHours(6); // Alert 6 hours before booking deadline
        return matchRepository.findMatchesNeedingAttention(now, alertTime);
    }
    
    public List<Match> getMatchesWithAvailableTickets() {
        return matchRepository.findMatchesWithAvailableTickets(LocalDateTime.now());
    }
    
    public List<Match> getMatchesAllowingRefund() {
        return matchRepository.findMatchesAllowingRefund(LocalDateTime.now());
    }
}