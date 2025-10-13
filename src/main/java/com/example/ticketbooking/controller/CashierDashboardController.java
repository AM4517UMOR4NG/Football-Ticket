package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cashier/dashboard")
@PreAuthorize("hasRole('CASHIER')")
@RequiredArgsConstructor
public class CashierDashboardController {

    private final BookingRepository bookingRepository;

    @GetMapping("/bookings")
    public List<BookingDTO> getAllBookings() {
        try {
            List<Booking> bookings = bookingRepository.findAllWithDetails();
            return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
        } catch (Exception ex) {
            // Avoid leaking exceptions as 400 responses; return empty list for robustness
            return java.util.Collections.emptyList();
        }
    }

    private BookingDTO convertToDto(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        if (booking.getEvent() != null) {
            dto.setEventTitle(booking.getEvent().getTitle());
        }
        dto.setNumberOfTickets(booking.getNumberOfTickets());
        dto.setTotalAmount(booking.getTotalAmount());
        if (booking.getStatus() != null) {
            dto.setStatus(booking.getStatus().name());
        }
        dto.setBookingDate(booking.getBookingDate());
        return dto;
    }
}