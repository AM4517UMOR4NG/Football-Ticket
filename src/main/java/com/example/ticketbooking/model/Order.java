package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "\"order\"")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int numberOfTickets;

    @Column(nullable = false)
    private double totalPrice;

    @Column(nullable = false)
    private byte status; // 0: Pending, 1: Confirmed, 2: Cancelled

    @Column
    private java.sql.Timestamp orderDate;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "\"user_id\"", nullable = false)
    private User user;
}