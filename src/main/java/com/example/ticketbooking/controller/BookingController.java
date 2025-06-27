package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.service.BookingService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")

public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequestDTO,
                                           BindingResult result,
                                           @RequestParam Long userId) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMessage);
        }
        try {
            BookingResponseDTO response = bookingService.createBooking(bookingRequestDTO, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create booking: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        try {
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching bookings for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to fetch bookings: " + e.getMessage());
        }
    }
}
