package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.LeagueDTO;

import java.util.List;

public interface LeagueService {
    
    List<LeagueDTO> getAllLeagues();
    
    List<LeagueDTO> getActiveLeagues();
    
    LeagueDTO getLeagueById(Long id);
    
    LeagueDTO getLeagueByName(String name);
    
    List<LeagueDTO> getLeaguesByCountry(String country);
    
    List<LeagueDTO> searchLeagues(String searchTerm);
    
    LeagueDTO createLeague(LeagueDTO leagueDTO);
    
    LeagueDTO updateLeague(Long id, LeagueDTO leagueDTO);
    
    void deleteLeague(Long id);
    
    Long getEventCountByLeague(Long leagueId);
} 