package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.League;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.LeagueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {
    private final EventRepository eventRepository;
    private final LeagueRepository leagueRepository;

    public EventServiceImpl(EventRepository eventRepository, LeagueRepository leagueRepository) {
        this.eventRepository = eventRepository;
        this.leagueRepository = leagueRepository;
    }

    @Override
    @Transactional
    public void createEvent(EventDTO eventDTO) {
        validateEventDTO(eventDTO);

        Event event = new Event();
        event.setTitle(eventDTO.title().trim());
        event.setDescription(eventDTO.description());
        event.setVenue(eventDTO.venue().trim());
        event.setEventDate(eventDTO.eventDate());
        event.setTotalSeats(eventDTO.totalSeats());
        event.setAvailableSeats(eventDTO.totalSeats());
        event.setPrice(eventDTO.price());
        event.setImageUrl(eventDTO.imageUrl());
        if (eventDTO.status() != null && !eventDTO.status().isBlank()) {
            event.setStatus(Event.EventStatus.valueOf(eventDTO.status().trim().toUpperCase(Locale.ROOT)));
        }

        if (eventDTO.leagueId() != null) {
            League league = leagueRepository.findById(eventDTO.leagueId())
                    .orElseThrow(() -> new IllegalArgumentException("League not found with id: " + eventDTO.leagueId()));
            event.setLeague(league);
        }

        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAllWithLeague().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findAllWithLeague().stream()
                .filter(event -> event.getEventDate() != null
                        && event.getEventDate().isAfter(now)
                        && event.getStatus() == Event.EventStatus.ACTIVE)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findByIdWithLeague(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return mapToDTO(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getEventsByLeague(String league) {
        return eventRepository.findAllWithLeague().stream()
                .filter(event -> isEventInLeague(event, league))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> searchEvents(String query, String venue, String date) {
        return searchEvents(query, venue, date, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> searchEvents(String query, String venue, String date, String league) {
        return eventRepository.findAllWithLeague().stream()
                .filter(event -> matchesSearchCriteria(event, query, venue, date, league))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void updateEvent(Long id, EventDTO eventDTO) {
        validateEventDTO(eventDTO);

        Event event = eventRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        int bookedSeats = Math.max(0, event.getTotalSeats() - event.getAvailableSeats());
        if (eventDTO.totalSeats() < bookedSeats) {
            throw new IllegalArgumentException(
                    "Total seats (" + eventDTO.totalSeats() + ") cannot be less than already booked seats (" + bookedSeats + ")");
        }

        event.setTitle(eventDTO.title().trim());
        event.setDescription(eventDTO.description());
        event.setVenue(eventDTO.venue().trim());
        event.setEventDate(eventDTO.eventDate());
        event.setTotalSeats(eventDTO.totalSeats());
        event.setAvailableSeats(eventDTO.totalSeats() - bookedSeats);
        event.setPrice(eventDTO.price());
        event.setImageUrl(eventDTO.imageUrl());

        if (eventDTO.status() != null && !eventDTO.status().isBlank()) {
            event.setStatus(Event.EventStatus.valueOf(eventDTO.status().trim().toUpperCase(Locale.ROOT)));
        }

        if (eventDTO.leagueId() != null) {
            League league = leagueRepository.findById(eventDTO.leagueId())
                    .orElseThrow(() -> new IllegalArgumentException("League not found with id: " + eventDTO.leagueId()));
            event.setLeague(league);
        } else {
            event.setLeague(null);
        }
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    private void validateEventDTO(EventDTO eventDTO) {
        if (eventDTO == null) {
            throw new IllegalArgumentException("Event payload is required");
        }
        if (eventDTO.title() == null || eventDTO.title().isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }
        if (eventDTO.venue() == null || eventDTO.venue().isBlank()) {
            throw new IllegalArgumentException("Event venue is required");
        }
        if (eventDTO.eventDate() == null) {
            throw new IllegalArgumentException("Event date is required");
        }
        if (eventDTO.totalSeats() == null || eventDTO.totalSeats() <= 0) {
            throw new IllegalArgumentException("Total seats must be greater than 0");
        }
        if (eventDTO.price() == null || eventDTO.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Event price must be non-negative");
        }
    }

    private EventDTO mapToDTO(Event event) {
        League league = event.getLeague();
        return new EventDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                event.getTotalSeats(),
                event.getAvailableSeats(),
                event.getPrice(),
                event.getImageUrl(),
                league != null ? league.getId() : null,
                league != null ? league.getName() : null,
                event.getStatus() != null ? event.getStatus().name() : Event.EventStatus.ACTIVE.name());
    }

    private boolean isEventInLeague(Event event, String leagueFilter) {
        if (leagueFilter == null || leagueFilter.isBlank()) {
            return true;
        }
        String normalizedFilter = leagueFilter.trim().toLowerCase(Locale.ROOT);

        // Prefer authoritative League FK relation
        if (event.getLeague() != null) {
            League league = event.getLeague();
            if (league.getId() != null && String.valueOf(league.getId()).equals(normalizedFilter)) {
                return true;
            }
            String leagueName = league.getName() != null ? league.getName().toLowerCase(Locale.ROOT) : "";
            String compactName = leagueName.replaceAll("[^a-z0-9]", "");
            String compactFilter = normalizedFilter.replaceAll("[^a-z0-9]", "");

            if (leagueName.equals(normalizedFilter) || compactName.equals(compactFilter)
                    || leagueName.contains(normalizedFilter)) {
                return true;
            }
            return switch (compactFilter) {
                case "premier", "pl", "premierleague" -> leagueName.contains("premier");
                case "laliga", "ll" -> leagueName.contains("la liga") || compactName.contains("laliga");
                case "bundesliga", "bl" -> leagueName.contains("bundesliga");
                case "seriea", "sa" -> leagueName.contains("serie a") || compactName.contains("seriea");
                case "ligue1", "l1" -> leagueName.contains("ligue 1") || compactName.contains("ligue1");
                case "champions", "ucl", "cl", "championsleague" -> leagueName.contains("champions");
                default -> false;
            };
        }

        // Legacy fallback when event has no league entity assigned
        String title = event.getTitle() != null ? event.getTitle().toLowerCase(Locale.ROOT) : "";
        String venue = event.getVenue() != null ? event.getVenue().toLowerCase(Locale.ROOT) : "";

        return switch (normalizedFilter) {
            case "premier" -> title.contains("manchester") || title.contains("chelsea") ||
                    title.contains("arsenal") || title.contains("liverpool") ||
                    title.contains("tottenham") || venue.contains("london") ||
                    venue.contains("manchester");
            case "laliga" -> title.contains("madrid") || title.contains("barcelona") ||
                    title.contains("atletico") || title.contains("sevilla");
            case "bundesliga" -> title.contains("bayern") || title.contains("dortmund") ||
                    title.contains("leipzig") || title.contains("leverkusen");
            case "seriea" -> title.contains("milan") || title.contains("juventus") || title.contains("napoli");
            case "ligue1" -> title.contains("psg") || title.contains("marseille") ||
                    title.contains("lyon") || title.contains("monaco");
            case "champions" -> title.contains("champions league") || title.contains("european");
            default -> false;
        };
    }

    private boolean matchesSearchCriteria(Event event, String query, String venue, String date, String league) {
        String title = event.getTitle() != null ? event.getTitle().toLowerCase(Locale.ROOT) : "";
        String description = event.getDescription() != null ? event.getDescription().toLowerCase(Locale.ROOT) : "";
        String eventVenue = event.getVenue() != null ? event.getVenue().toLowerCase(Locale.ROOT) : "";

        boolean matchesQuery = query == null || query.isBlank() ||
                title.contains(query.toLowerCase(Locale.ROOT)) ||
                description.contains(query.toLowerCase(Locale.ROOT)) ||
                eventVenue.contains(query.toLowerCase(Locale.ROOT));

        boolean matchesVenue = venue == null || venue.isBlank() ||
                eventVenue.contains(venue.toLowerCase(Locale.ROOT));

        boolean matchesDate = date == null || date.isBlank() ||
                (event.getEventDate() != null && event.getEventDate().toLocalDate().toString().equals(date));

        boolean matchesLeague = league == null || league.isBlank() || isEventInLeague(event, league);

        return matchesQuery && matchesVenue && matchesDate && matchesLeague;
    }
}
