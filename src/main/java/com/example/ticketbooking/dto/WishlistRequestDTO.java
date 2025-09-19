package com.example.ticketbooking.dto;

import jakarta.validation.constraints.NotNull;

public record WishlistRequestDTO(
    @NotNull(message = "Event ID is required")
    Long eventId,
    
    Boolean notifyOnPriceDrop,
    Boolean notifyBeforeEvent
) {}
