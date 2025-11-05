package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/cashier")
@RequiredArgsConstructor
public class PublicCashierController {

    private final BookingRepository bookingRepository;

    @GetMapping("/bookings")
    public List<BookingDTO> getAllBookings() {
        try {
            System.out.println("PublicCashierController: Getting all bookings");
            List<Booking> bookings = bookingRepository.findAll();
            System.out.println("PublicCashierController: Found " + bookings.size() + " bookings");
            List<BookingDTO> result = bookings.stream().map(this::convertToDto).collect(Collectors.toList());
            System.out.println("PublicCashierController: Converted to " + result.size() + " DTOs");
            return result;
        } catch (Exception ex) {
            System.err.println("PublicCashierController: Error getting bookings: " + ex.getMessage());
            ex.printStackTrace();
            return java.util.Collections.emptyList();
        }
    }

    @GetMapping("/test")
    public String testEndpoint() {
        return "Public cashier endpoint is working!";
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
