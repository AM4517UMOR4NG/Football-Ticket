package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEvents() {
        List<EventDTO> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<EventDTO>> getFeaturedEvents() {
        List<EventDTO> events = eventService.getUpcomingEvents();
        // Return first 3 events as featured
        List<EventDTO> featuredEvents = events.stream()
                .limit(3)
                .collect(Collectors.toList());
        return ResponseEntity.ok(featuredEvents);
    }

    @GetMapping("/league/{league}")
    public ResponseEntity<List<EventDTO>> getEventsByLeague(@PathVariable String league) {
        List<EventDTO> events = eventService.getEventsByLeague(league);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<List<EventDTO>> searchEvents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String venue,
            @RequestParam(required = false) String date) {
        List<EventDTO> events = eventService.searchEvents(query, venue, date);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/leagues")
    public ResponseEntity<Map<String, Object>> getAvailableLeagues() {
        Map<String, Object> leagues = Map.of(
            "premier", Map.of("name", "Premier League", "country", "England", "color", "blue"),
            "laliga", Map.of("name", "La Liga", "country", "Spain", "color", "red"),
            "bundesliga", Map.of("name", "Bundesliga", "country", "Germany", "color", "green"),
            "seriea", Map.of("name", "Serie A", "country", "Italy", "color", "blue"),
            "ligue1", Map.of("name", "Ligue 1", "country", "France", "color", "purple"),
            "champions", Map.of("name", "Champions League", "country", "Europe", "color", "gold")
        );
        return ResponseEntity.ok(leagues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        try {
            EventDTO event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEventStats() {
        List<EventDTO> allEvents = eventService.getAllEvents();
        List<EventDTO> upcomingEvents = eventService.getUpcomingEvents();
        
        Map<String, Object> stats = Map.of(
            "totalEvents", allEvents.size(),
            "upcomingEvents", upcomingEvents.size(),
            "totalSeats", allEvents.stream().mapToInt(EventDTO::totalSeats).sum(),
            "averagePrice", allEvents.stream()
                .mapToDouble(e -> e.price().doubleValue())
                .average()
                .orElse(0.0)
        );
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody EventDTO eventDTO) {
        try {
            eventService.createEvent(eventDTO);
            return ResponseEntity.ok("Event created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create event: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody EventDTO eventDTO) {
        try {
            eventService.updateEvent(id, eventDTO);
            return ResponseEntity.ok("Event updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update event: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok("Event deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete event: " + e.getMessage());
        }
    }
}
