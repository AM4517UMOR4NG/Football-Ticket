package com.example.ticketbooking.controller;

import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        stats.put("totalBookingsConfirmed",
                bookingRepository.countByStatus(com.example.ticketbooking.entity.Booking.BookingStatus.CONFIRMED));
        stats.put("totalBookingsCancelled",
                bookingRepository.countByStatus(com.example.ticketbooking.entity.Booking.BookingStatus.CANCELLED));
        // You can add more stats here as needed
        return ResponseEntity.ok(stats);
    }
}