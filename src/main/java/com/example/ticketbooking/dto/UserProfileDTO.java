package com.example.ticketbooking.dto;

import java.time.LocalDateTime;

public record UserProfileDTO(
                Long id,
                String username,
                String email,
                String fullName,
                String role,
                String phone,
                String address,
                LocalDateTime createdAt) {
}