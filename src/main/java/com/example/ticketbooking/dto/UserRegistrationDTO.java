package com.example.ticketbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegistrationDTO(
        @NotBlank(message = "Username is required") @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters") String username,

        @NotBlank(message = "Email is required") @Email(message = "Please provide a valid email address") String email,

        @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters long") String password,

        @NotBlank(message = "Full name is required") @Size(max = 100, message = "Full name cannot exceed 100 characters") String fullName,

        @Size(max = 15, message = "Phone number cannot exceed 15 characters") String phoneNumber,

        @Size(max = 20, message = "Role cannot exceed 20 characters") String role) {
}