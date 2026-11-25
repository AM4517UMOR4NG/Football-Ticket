package com.example.ticketbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventDTO(
        Long id,
        String title,
        String description,
        String venue,
        LocalDateTime eventDate,
        Integer totalSeats,
        Integer availableSeats,
        BigDecimal price,
        String imageUrl,
        Long leagueId,
        String leagueName,
        String status) {

    public EventDTO(
            Long id,
            String title,
            String description,
            String venue,
            LocalDateTime eventDate,
            Integer totalSeats,
            BigDecimal price,
            String imageUrl,
            Long leagueId) {
        this(id, title, description, venue, eventDate, totalSeats, totalSeats, price, imageUrl, leagueId, null, "ACTIVE");
    }
}
