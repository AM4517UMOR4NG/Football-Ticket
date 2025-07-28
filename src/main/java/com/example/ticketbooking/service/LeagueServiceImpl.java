package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.LeagueDTO;
import com.example.ticketbooking.entity.League;
import com.example.ticketbooking.repository.LeagueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeagueServiceImpl implements LeagueService {
    
    private final LeagueRepository leagueRepository;
    
    @Override
    public List<LeagueDTO> getAllLeagues() {
        return leagueRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LeagueDTO> getActiveLeagues() {
        return leagueRepository.findActiveLeagues().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public LeagueDTO getLeagueById(Long id) {
        League league = leagueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("League not found with id: " + id));
        return mapToDTO(league);
    }
    
    @Override
    public LeagueDTO getLeagueByName(String name) {
        League league = leagueRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("League not found with name: " + name));
        return mapToDTO(league);
    }
    
    @Override
    public List<LeagueDTO> getLeaguesByCountry(String country) {
        return leagueRepository.findByCountry(country).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<LeagueDTO> searchLeagues(String searchTerm) {
        return leagueRepository.searchLeagues(searchTerm).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public LeagueDTO createLeague(LeagueDTO leagueDTO) {
        League league = mapToEntity(leagueDTO);
        League savedLeague = leagueRepository.save(league);
        return mapToDTO(savedLeague);
    }
    
    @Override
    public LeagueDTO updateLeague(Long id, LeagueDTO leagueDTO) {
        League existingLeague = leagueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("League not found with id: " + id));
        
        existingLeague.setName(leagueDTO.name());
        existingLeague.setDescription(leagueDTO.description());
        existingLeague.setCountry(leagueDTO.country());
        existingLeague.setFoundedYear(leagueDTO.foundedYear());
        existingLeague.setLogoUrl(leagueDTO.logoUrl());
        existingLeague.setBannerUrl(leagueDTO.bannerUrl());
        existingLeague.setTotalTeams(leagueDTO.totalTeams());
        existingLeague.setSeasonStart(leagueDTO.seasonStart());
        existingLeague.setSeasonEnd(leagueDTO.seasonEnd());
        existingLeague.setStatus(League.LeagueStatus.valueOf(leagueDTO.status()));
        existingLeague.setUpdatedAt(java.time.LocalDateTime.now());
        
        League updatedLeague = leagueRepository.save(existingLeague);
        return mapToDTO(updatedLeague);
    }
    
    @Override
    public void deleteLeague(Long id) {
        if (!leagueRepository.existsById(id)) {
            throw new RuntimeException("League not found with id: " + id);
        }
        leagueRepository.deleteById(id);
    }
    
    @Override
    public Long getEventCountByLeague(Long leagueId) {
        return leagueRepository.countEventsByLeagueId(leagueId);
    }
    
    private LeagueDTO mapToDTO(League league) {
        return new LeagueDTO(
                league.getId(),
                league.getName(),
                league.getDescription(),
                league.getCountry(),
                league.getFoundedYear(),
                league.getLogoUrl(),
                league.getBannerUrl(),
                league.getTotalTeams(),
                league.getSeasonStart(),
                league.getSeasonEnd(),
                league.getStatus().name(),
                league.getCreatedAt(),
                league.getUpdatedAt()
        );
    }
    
    private League mapToEntity(LeagueDTO leagueDTO) {
        League league = new League();
        league.setName(leagueDTO.name());
        league.setDescription(leagueDTO.description());
        league.setCountry(leagueDTO.country());
        league.setFoundedYear(leagueDTO.foundedYear());
        league.setLogoUrl(leagueDTO.logoUrl());
        league.setBannerUrl(leagueDTO.bannerUrl());
        league.setTotalTeams(leagueDTO.totalTeams());
        league.setSeasonStart(leagueDTO.seasonStart());
        league.setSeasonEnd(leagueDTO.seasonEnd());
        league.setStatus(League.LeagueStatus.valueOf(leagueDTO.status()));
        return league;
    }
} 