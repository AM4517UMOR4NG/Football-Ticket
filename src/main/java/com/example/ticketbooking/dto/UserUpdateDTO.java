package com.example.ticketbooking.dto;

public record UserUpdateDTO(
                String fullName,
                String email,
                String phone,
                String address) {
}