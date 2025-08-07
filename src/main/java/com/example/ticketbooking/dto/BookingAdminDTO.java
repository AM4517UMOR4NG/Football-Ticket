package com.example.ticketbooking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingAdminDTO {
    public Long id;
    public String bookingReference;
    public Long userId;
    public String username;
    public Long eventId;
    public String eventTitle;
    public Integer numberOfTickets;
    public BigDecimal totalAmount;
    public String status;
    public LocalDateTime bookingDate;
}