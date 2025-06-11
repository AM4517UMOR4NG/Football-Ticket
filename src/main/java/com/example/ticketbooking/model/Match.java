package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private LocalTime time;
    private String homeTeam;
    private String awayTeam;
    private String venue;
    private double pricePerTicket;
    private int totalTickets;
    private int availableTickets;
}