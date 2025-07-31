package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.LeagueDTO;
import com.example.ticketbooking.service.LeagueService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/leagues")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeagueController {
    
    private static final Logger logger = LoggerFactory.getLogger(LeagueController.class);
    
    private final LeagueService leagueService;
    
    @GetMapping
    public ResponseEntity<List<LeagueDTO>> getAllLeagues() {
        try {
            List<LeagueDTO> leagues = leagueService.getAllLeagues();
            return ResponseEntity.ok(leagues);
        } catch (Exception e) {
            logger.error("Error fetching all leagues: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<LeagueDTO>> getActiveLeagues() {
        try {
            List<LeagueDTO> leagues = leagueService.getActiveLeagues();
            return ResponseEntity.ok(leagues);
        } catch (Exception e) {
            logger.error("Error fetching active leagues: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeagueDTO> getLeagueById(@PathVariable Long id) {
        try {
            LeagueDTO league = leagueService.getLeagueById(id);
            return ResponseEntity.ok(league);
        } catch (RuntimeException e) {
            logger.error("League not found with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching league with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<LeagueDTO> getLeagueByName(@PathVariable String name) {
        try {
            LeagueDTO league = leagueService.getLeagueByName(name);
            return ResponseEntity.ok(league);
        } catch (RuntimeException e) {
            logger.error("League not found with name {}: {}", name, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching league with name {}: {}", name, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/country/{country}")
    public ResponseEntity<List<LeagueDTO>> getLeaguesByCountry(@PathVariable String country) {
        try {
            List<LeagueDTO> leagues = leagueService.getLeaguesByCountry(country);
            return ResponseEntity.ok(leagues);
        } catch (Exception e) {
            logger.error("Error fetching leagues by country {}: {}", country, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<LeagueDTO>> searchLeagues(@RequestParam String query) {
        try {
            List<LeagueDTO> leagues = leagueService.searchLeagues(query);
            return ResponseEntity.ok(leagues);
        } catch (Exception e) {
            logger.error("Error searching leagues with query {}: {}", query, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/events/count")
    public ResponseEntity<Map<String, Object>> getEventCountByLeague(@PathVariable Long id) {
        try {
            Long eventCount = leagueService.getEventCountByLeague(id);
            return ResponseEntity.ok(Map.of("leagueId", id, "eventCount", eventCount));
        } catch (Exception e) {
            logger.error("Error getting event count for league {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllLeaguesMap() {
        try {
            Map<String, Object> leaguesMap = new HashMap<>();
            
            // Convert to the format expected by frontend
            leaguesMap.put("premier", Map.of("name", "Premier League", "country", "England", "color", "blue"));
            leaguesMap.put("laliga", Map.of("name", "La Liga", "country", "Spain", "color", "red"));
            leaguesMap.put("bundesliga", Map.of("name", "Bundesliga", "country", "Germany", "color", "green"));
            leaguesMap.put("seriea", Map.of("name", "Serie A", "country", "Italy", "color", "blue"));
            leaguesMap.put("ligue1", Map.of("name", "Ligue 1", "country", "France", "color", "purple"));
            leaguesMap.put("champions", Map.of("name", "Champions League", "country", "Europe", "color", "gold"));
            
            return ResponseEntity.ok(leaguesMap);
        } catch (Exception e) {
            logger.error("Error fetching all leagues map: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<LeagueDTO> createLeague(@RequestBody LeagueDTO leagueDTO) {
        try {
            LeagueDTO createdLeague = leagueService.createLeague(leagueDTO);
            return ResponseEntity.ok(createdLeague);
        } catch (Exception e) {
            logger.error("Error creating league: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LeagueDTO> updateLeague(@PathVariable Long id, @RequestBody LeagueDTO leagueDTO) {
        try {
            LeagueDTO updatedLeague = leagueService.updateLeague(id, leagueDTO);
            return ResponseEntity.ok(updatedLeague);
        } catch (RuntimeException e) {
            logger.error("League not found with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating league with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeague(@PathVariable Long id) {
        try {
            leagueService.deleteLeague(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("League not found with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting league with id {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
} 