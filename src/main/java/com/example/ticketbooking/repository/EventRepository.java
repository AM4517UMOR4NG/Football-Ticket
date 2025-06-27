package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(Event.EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.eventDate > :currentDate AND e.status = :status")
    List<Event> findUpcomingEvents(LocalDateTime currentDate, Event.EventStatus status);

    List<Event> findByVenueContainingIgnoreCase(String venue);

    List<Event> findByTitleContainingIgnoreCase(String title);
}