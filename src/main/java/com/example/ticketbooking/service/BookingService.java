package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findById(requestDTO.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (event.getAvailableSeats() < requestDTO.getNumberOfTickets()) {
            throw new IllegalArgumentException("Not enough available seats");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setNumberOfTickets(requestDTO.getNumberOfTickets());
        booking.setTotalAmount(
                event.getPrice().multiply(java.math.BigDecimal.valueOf(requestDTO.getNumberOfTickets())));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setBookingReference(generateBookingReference());

        event.setAvailableSeats(event.getAvailableSeats() - requestDTO.getNumberOfTickets());
        eventRepository.save(event);
        bookingRepository.save(booking);

        return mapToDto(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        logger.info("Fetching bookings for userId: {}", userId);
        List<Booking> bookings = bookingRepository.findByUser_Id(userId);
        if (bookings.isEmpty()) {
            logger.info("No bookings found for userId: {}", userId);
            return Collections.emptyList();
        }
        return bookings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private BookingResponseDTO mapToDto(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setBookingReference(booking.getBookingReference());
        dto.setEventTitle(booking.getEvent().getTitle());
        dto.setVenue(booking.getEvent().getVenue());
        dto.setEventDate(booking.getEvent().getEventDate());
        dto.setNumberOfTickets(booking.getNumberOfTickets());
        dto.setTotalAmount(booking.getTotalAmount() != null ? booking.getTotalAmount().doubleValue() : null);
        dto.setStatus(booking.getStatus() != null ? booking.getStatus().toString() : null);
        return dto;
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis();
    }
}