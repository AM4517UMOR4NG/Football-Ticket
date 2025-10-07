package com.example.ticketbooking.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CashierDashboardDTO {
    private Long id;
    private String bookingReference;
    private String eventTitle;
    private Integer numberOfTickets;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime bookingDate;
}