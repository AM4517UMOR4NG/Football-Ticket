package com.example.ticketbooking.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ticket_users") // Mengganti nama tabel dari "user" menjadi "ticket_users"
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;
}