package com.example.ticketbooking.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BookingRequestDTO {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "Number of tickets must be at least 1")
    @Max(value = 10, message = "Number of tickets cannot exceed 10")
    private Integer numberOfTickets;

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Integer getNumberOfTickets() {
        return numberOfTickets;
    }

    public void setNumberOfTickets(Integer numberOfTickets) {
        this.numberOfTickets = numberOfTickets;
    }
}
