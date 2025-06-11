package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.Match;
import com.example.ticketbooking.entity.MatchStatus;
import com.example.ticketbooking.entity.MatchCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    // Find matches by status
    List<Match> findByStatus(MatchStatus status);
    
    // Find matches by category
    List<Match> findByCategory(MatchCategory category);
    
    // Find upcoming matches (scheduled and future date)
    @Query("SELECT m FROM Match m WHERE m.status = 'SCHEDULED' AND m.matchDate > :currentDate ORDER BY m.matchDate ASC")
    List<Match> findUpcomingMatches(@Param("currentDate") LocalDateTime currentDate);
    
    // Find matches that are currently open for booking
    @Query("SELECT m FROM Match m WHERE m.status = 'SCHEDULED' AND m.bookingDeadline > :currentDate AND m.ticketsSold < m.capacity ORDER BY m.matchDate ASC")
    List<Match> findOpenForBooking(@Param("currentDate") LocalDateTime currentDate);
    
    // Find matches by team (home or away)
    @Query("SELECT m FROM Match m WHERE m.homeTeam LIKE %:teamName% OR m.awayTeam LIKE %:teamName%")
    List<Match> findByTeamName(@Param("teamName") String teamName);
    
    // Find matches by venue
    List<Match> findByVenueContainingIgnoreCase(String venue);
    
    // Find matches within date range
    @Query("SELECT m FROM Match m WHERE m.matchDate BETWEEN :startDate AND :endDate ORDER BY m.matchDate ASC")
    List<Match> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Find popular matches (high booking percentage)
    @Query("SELECT m FROM Match m WHERE m.status = 'SCHEDULED' AND (CAST(m.ticketsSold AS double) / CAST(m.capacity AS double)) > :threshold ORDER BY m.ticketsSold DESC")
    List<Match> findPopularMatches(@Param("threshold") Double threshold);
    
    // Find matches created by specific admin
    List<Match> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    
    // Find matches that need attention (booking deadline approaching)
    @Query("SELECT m FROM Match m WHERE m.status = 'SCHEDULED' AND m.bookingDeadline BETWEEN :currentDate AND :alertDate")
    List<Match> findMatchesNeedingAttention(@Param("currentDate") LocalDateTime currentDate, @Param("alertDate") LocalDateTime alertDate);
    
    // Count matches by status
    long countByStatus(MatchStatus status);
    
    // Count matches by category
    long countByCategory(MatchCategory category);
    
    // Find matches with available tickets
    @Query("SELECT m FROM Match m WHERE m.status = 'SCHEDULED' AND m.ticketsSold < m.capacity AND m.bookingDeadline > :currentDate")
    List<Match> findMatchesWithAvailableTickets(@Param("currentDate") LocalDateTime currentDate);
    
    // Search matches by multiple criteria
    @Query("SELECT m FROM Match m WHERE " +
           "(:matchName IS NULL OR m.matchName LIKE %:matchName%) AND " +
           "(:homeTeam IS NULL OR m.homeTeam LIKE %:homeTeam%) AND " +
           "(:awayTeam IS NULL OR m.awayTeam LIKE %:awayTeam%) AND " +
           "(:venue IS NULL OR m.venue LIKE %:venue%) AND " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:status IS NULL OR m.status = :status) " +
           "ORDER BY m.matchDate ASC")
    List<Match> searchMatches(@Param("matchName") String matchName,
                             @Param("homeTeam") String homeTeam,
                             @Param("awayTeam") String awayTeam,
                             @Param("venue") String venue,
                             @Param("category") MatchCategory category,
                             @Param("status") MatchStatus status);
    
    // Statistics queries
    @Query("SELECT COUNT(m) FROM Match m WHERE m.status = 'SCHEDULED'")
    long countScheduledMatches();
    
    @Query("SELECT SUM(m.ticketsSold) FROM Match m WHERE m.status = 'FINISHED'")
    Long getTotalTicketsSold();
    
    @Query("SELECT AVG(m.ticketPrice) FROM Match m WHERE m.status = 'SCHEDULED'")
    Double getAverageTicketPrice();
    
    // Find matches that allow refunds
    @Query("SELECT m FROM Match m WHERE m.refundAllowed = true AND m.refundDeadline > :currentDate")
    List<Match> findMatchesAllowingRefund(@Param("currentDate") LocalDateTime currentDate);
}