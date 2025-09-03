package com.example.ticketbooking.controller;

import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.dto.BookingAdminDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    // User Analytics & Management
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
        if (!userRepository.existsById(id))
            return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // Booking Analytics & Management
    @GetMapping("/bookings")
    @Transactional(readOnly = true)
    public java.util.List<BookingAdminDTO> getAllBookings() {
        java.util.List<Booking> bookings = bookingRepository.findAll();
        java.util.List<BookingAdminDTO> dtos = new ArrayList<>();
        for (Booking booking : bookings) {
            if (booking.getUser() == null || booking.getEvent() == null)
                continue;
            BookingAdminDTO dto = new BookingAdminDTO();
            dto.id = booking.getId();
            dto.bookingReference = booking.getBookingReference();
            dto.userId = booking.getUser().getId();
            dto.username = booking.getUser().getUsername();
            dto.eventId = booking.getEvent().getId();
            dto.eventTitle = booking.getEvent().getTitle();
            dto.numberOfTickets = booking.getNumberOfTickets();
            dto.totalAmount = booking.getTotalAmount();
            dto.status = booking.getStatus() != null ? booking.getStatus().name() : null;
            dto.bookingDate = booking.getBookingDate();
            dtos.add(dto);
        }
        return dtos;
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
        if (!bookingRepository.existsById(id))
            return ResponseEntity.notFound().build();
        bookingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}