package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.service.BookingService;
import com.example.ticketbooking.service.UserService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")

public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

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

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, @RequestParam Long userId) {
        try {
            BookingResponseDTO response = bookingService.cancelBooking(bookingId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to cancel booking", e.getMessage()));
        }
    }

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId, @RequestParam Long userId) {
        try {
            BookingResponseDTO response = bookingService.confirmBooking(bookingId, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error confirming booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to confirm booking", e.getMessage()));
        }
    }

    static class ErrorResponse {
        public String error;
        public String detail;

        public ErrorResponse(String error, String detail) {
            this.error = error;
            this.detail = detail;
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

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getCurrentUserBookings() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<BookingResponseDTO> bookings = bookingService.getUserBookings(user.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching current user bookings: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch bookings: " + e.getMessage()));
        }
    }
}
