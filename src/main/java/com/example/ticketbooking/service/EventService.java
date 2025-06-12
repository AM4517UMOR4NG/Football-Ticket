package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.EventDTO;
import java.util.List;

public interface EventService {
    void createEvent(EventDTO eventDTO);
    List<EventDTO> getAllEvents();
    List<EventDTO> getUpcomingEvents();
    Object getEventById(Long id);
}