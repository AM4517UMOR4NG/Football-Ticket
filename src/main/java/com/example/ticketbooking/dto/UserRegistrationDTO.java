package com.example.ticketbooking.dto;

public record UserRegistrationDTO(
    String username,
    String email,
    String password,
    String fullName,
    String phoneNumber,
    String role
) {}