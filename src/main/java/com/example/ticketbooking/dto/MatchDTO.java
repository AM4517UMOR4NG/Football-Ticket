package com.example.ticketbooking.dto;

import java.time.LocalDateTime;

public record MatchDTO(
    Long id,
    String homeTeam,
    String awayTeam,
    String venue,
    LocalDateTime date,
    String time,
    Integer availableTickets,
    Double pricePerTicket
) {}