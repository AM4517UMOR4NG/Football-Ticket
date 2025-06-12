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
        event.setAvailableSeats(eventDTO.totalSeats()); // Initialize availableSeats
        eventRepository.save(event);
    }

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
            .map(event -> new EventDTO(
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                event.getTotalSeats(),
                event.getPrice()
            ))
            .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findAll().stream()
            .filter(event -> event.getEventDate().isAfter(LocalDateTime.now()))
            .map(event -> new EventDTO(
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                event.getTotalSeats(),
                event.getPrice()
            ))
            .collect(Collectors.toList());
    }

    @Override
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
    }
}