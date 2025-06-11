package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "\"order\"") // Escape the table name with double quotes
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Match match;

    private int numberOfTickets;
    private double totalPrice;
    private OrderStatus status;
    private LocalDateTime orderDate;
}