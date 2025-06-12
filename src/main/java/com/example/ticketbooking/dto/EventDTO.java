package com.example.ticketbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventDTO(
    String title,
    String description,
    String venue,
    LocalDateTime eventDate,
    Integer totalSeats,
    BigDecimal price
) {}