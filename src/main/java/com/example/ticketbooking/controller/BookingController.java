package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public BookingResponseDTO createBooking(@RequestParam Long userId, @Valid @RequestBody BookingRequestDTO request) {
        return bookingService.createBooking(userId, request);
    }

    @GetMapping("/user/{userId}")
    public List<BookingResponseDTO> getUserBookings(@PathVariable Long userId) {
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/reference/{reference}")
    public BookingResponseDTO getBookingByReference(@PathVariable String reference) {
        return bookingService.getBookingByReference(reference);
    }
}