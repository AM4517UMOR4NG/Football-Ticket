package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

import com.example.ticketbooking.entity.User;

@Entity
@Table(name = "ticket_orders") // Mengganti nama tabel dari "order" menjadi "ticket_orders"
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int numberOfTickets;
    private Timestamp orderDate;
    private OrderStatus status;
    private double totalPrice;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}