package com.example.ticketbooking.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class BookingResponseDTO {
    private Long id;
    private String bookingReference;
    private String eventTitle;
    private String venue;
    private LocalDateTime eventDate;
    private Integer numberOfTickets;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime bookingDate;
}