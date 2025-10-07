package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/dashboard")
@PreAuthorize("hasRole('USER')")
@RequiredArgsConstructor
public class UserDashboardController {

    private final BookingRepository bookingRepository;
    private final UserService userService;

    @GetMapping("/bookings")
    public List<BookingDTO> getUserBookings() {
        User currentUser = userService.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByUser(currentUser);
        return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
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