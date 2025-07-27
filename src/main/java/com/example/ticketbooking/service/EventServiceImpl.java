package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public void createEvent(EventDTO eventDTO) {
        Event event = new Event();
        event.setTitle(eventDTO.title());
        event.setDescription(eventDTO.description());
        event.setVenue(eventDTO.venue());
        event.setEventDate(eventDTO.eventDate());
        event.setTotalSeats(eventDTO.totalSeats());
        event.setPrice(eventDTO.price());
        event.setAvailableSeats(eventDTO.totalSeats());
        eventRepository.save(event);
    }

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findAll().stream()
                .filter(event -> event.getEventDate().isAfter(LocalDateTime.now()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToDTO(event);
    }

    @Override
    public List<EventDTO> getEventsByLeague(String league) {
        return eventRepository.findAll().stream()
                .filter(event -> isEventInLeague(event, league))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> searchEvents(String query, String venue, String date) {
        return eventRepository.findAll().stream()
                .filter(event -> matchesSearchCriteria(event, query, venue, date))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private EventDTO mapToDTO(Event event) {
        return new EventDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                event.getTotalSeats(),
                event.getPrice()
        );
    }

    private boolean isEventInLeague(Event event, String league) {
        String title = event.getTitle().toLowerCase();
        String venue = event.getVenue().toLowerCase();
        
        return switch (league.toLowerCase()) {
            case "premier" -> title.contains("manchester") || title.contains("chelsea") || 
                             title.contains("arsenal") || title.contains("liverpool") ||
                             title.contains("tottenham") || venue.contains("london") ||
                             venue.contains("manchester") || venue.contains("old trafford") ||
                             venue.contains("stamford bridge") || venue.contains("etihad");
            case "laliga" -> title.contains("madrid") || title.contains("barcelona") ||
                            title.contains("atletico") || title.contains("sevilla") ||
                            venue.contains("madrid") || venue.contains("barcelona") ||
                            venue.contains("bernabeu") || venue.contains("metropolitano");
            case "bundesliga" -> title.contains("bayern") || title.contains("dortmund") ||
                                title.contains("leipzig") || title.contains("leverkusen") ||
                                venue.contains("munich") || venue.contains("allianz") ||
                                venue.contains("red bull arena");
            case "seriea" -> title.contains("milan") || title.contains("juventus") ||
                            title.contains("napoli") || venue.contains("milan") ||
                            venue.contains("san siro") || venue.contains("turin");
            case "ligue1" -> title.contains("psg") || title.contains("marseille") ||
                            title.contains("lyon") || title.contains("monaco") ||
                            venue.contains("paris") || venue.contains("parc des princes") ||
                            venue.contains("groupama");
            case "champions" -> title.contains("champions league") || title.contains("european");
            default -> false;
        };
    }

    private boolean matchesSearchCriteria(Event event, String query, String venue, String date) {
        boolean matchesQuery = query == null || query.isEmpty() ||
                event.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                event.getDescription().toLowerCase().contains(query.toLowerCase());
        
        boolean matchesVenue = venue == null || venue.isEmpty() ||
                event.getVenue().toLowerCase().contains(venue.toLowerCase());
        
        boolean matchesDate = date == null || date.isEmpty() ||
                event.getEventDate().toLocalDate().toString().equals(date);
        
        return matchesQuery && matchesVenue && matchesDate;
    }
}