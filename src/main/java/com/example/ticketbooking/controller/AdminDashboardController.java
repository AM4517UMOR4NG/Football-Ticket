package com.example.ticketbooking.controller;

import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // --- USER ANALYTICS & MANAGEMENT ---
    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/users/{id}")
    @Transactional(readOnly = true)
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @GetMapping("/users/stats")
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        return stats;
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // --- BOOKING ANALYTICS & MANAGEMENT ---
    @GetMapping("/bookings")
    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        // Initialize lazy-loaded user and event proxies within the transaction
        bookings.forEach(booking -> {
            if (booking.getUser() != null) {
                booking.getUser().getId(); // Forces User proxy initialization
            }
            if (booking.getEvent() != null) {
                booking.getEvent().getId(); // Forces Event proxy initialization
            }
        });
        return bookings;
    }

    @GetMapping("/bookings/stats")
    @Transactional(readOnly = true)
    public Map<String, Object> getBookingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", bookingRepository.count());
        stats.put("confirmed", bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED));
        stats.put("cancelled", bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED));
        stats.put("completed", bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));
        return stats;
    }

    @DeleteMapping("/bookings/{id}")
    @Transactional
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        if (!bookingRepository.existsById(id)) return ResponseEntity.notFound().build();
        bookingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}