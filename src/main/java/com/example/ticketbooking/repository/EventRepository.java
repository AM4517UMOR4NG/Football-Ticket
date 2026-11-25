package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.Event;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.league")
    List<Event> findAllWithLeague();

    @Query("SELECT e FROM Event e LEFT JOIN FETCH e.league WHERE e.id = :id")
    Optional<Event> findByIdWithLeague(@Param("id") Long id);

    List<Event> findByStatus(Event.EventStatus status);

    @Query("SELECT e FROM Event e WHERE e.eventDate > :currentDate AND e.status = :status")
    List<Event> findUpcomingEvents(LocalDateTime currentDate, Event.EventStatus status);

    List<Event> findByVenueContainingIgnoreCase(String venue);

    List<Event> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = :status")
    Long countByStatus(@Param("status") Event.EventStatus status);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.eventDate > :date")
    Long countByEventDateAfter(@Param("date") LocalDateTime date);
}
