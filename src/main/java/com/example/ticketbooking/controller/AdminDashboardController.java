package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.UserDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.dto.BookingAdminDTO;
import com.example.ticketbooking.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

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
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::convertToUserDto).collect(Collectors.toList());
    }

    @GetMapping("/admins")
    @Transactional(readOnly = true)
    public List<UserDTO> getAllAdmins() {
        return userRepository.findByRole("ADMIN").stream().map(this::convertToUserDto).collect(Collectors.toList());
    }

    @GetMapping("/cashiers")
    @Transactional(readOnly = true)
    public List<UserDTO> getAllCashiers() {
        return userRepository.findByRole("CASHIER").stream().map(this::convertToUserDto).collect(Collectors.toList());
    }

    @GetMapping("/users/{id}")
    @Transactional(readOnly = true)
    public UserDTO getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToUserDto(user);
    }

    @GetMapping("/users/stats")
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", userRepository.count());
        stats.put("admins", userRepository.countByRole("ADMIN"));
        stats.put("cashiers", userRepository.countByRole("CASHIER"));
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

    private UserDTO convertToUserDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
