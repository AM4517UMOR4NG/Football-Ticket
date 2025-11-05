package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
            System.out.println("CashierDashboardController: Getting all bookings");
            List<Booking> bookings = bookingRepository.findAll();
            System.out.println("CashierDashboardController: Found " + bookings.size() + " bookings");
            List<BookingDTO> result = bookings.stream().map(this::convertToDto).collect(Collectors.toList());
            System.out.println("CashierDashboardController: Converted to " + result.size() + " DTOs");
            return result;
        } catch (Exception ex) {
            System.err.println("CashierDashboardController: Error getting bookings: " + ex.getMessage());
            ex.printStackTrace();
            // Avoid leaking exceptions as 400 responses; return empty list for robustness
            return java.util.Collections.emptyList();
        }
    }

    @GetMapping("/test")
    public String testEndpoint() {
        return "Cashier dashboard is working!";
    }

    @GetMapping("/bookings/{bookingReference}")
    public BookingDTO getBookingByReference(@PathVariable String bookingReference) {
        try {
            return bookingRepository.findByBookingReference(bookingReference)
                    .map(this::convertToDto)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    @GetMapping("/bookings/status/{status}")
    public List<BookingDTO> getBookingsByStatus(@PathVariable String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            List<Booking> bookings = bookingRepository.findByStatus(bookingStatus);
            return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
        } catch (Exception ex) {
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