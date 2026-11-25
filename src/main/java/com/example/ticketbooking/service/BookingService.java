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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    @Autowired
    private MidtransService midtransService;

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO requestDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Event event = eventRepository.findByIdForUpdate(requestDTO.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (event.getStatus() != Event.EventStatus.ACTIVE) {
            throw new IllegalArgumentException("Event is not active for booking");
        }
        if (event.getEventDate() != null && event.getEventDate().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book tickets for a past event");
        }
        if (event.getAvailableSeats() < requestDTO.getNumberOfTickets()) {
            throw new IllegalArgumentException("Not enough available seats");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setNumberOfTickets(requestDTO.getNumberOfTickets());
        booking.setTotalAmount(
                event.getPrice().multiply(java.math.BigDecimal.valueOf(requestDTO.getNumberOfTickets())));
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setBookingReference(generateBookingReference());

        event.setAvailableSeats(event.getAvailableSeats() - requestDTO.getNumberOfTickets());
        eventRepository.save(event);
        bookingRepository.save(booking);

        // Create Midtrans Snap token only if gateway is configured
        BookingResponseDTO dto = mapToDto(booking);
        if (midtransService.isConfigured()) {
            try {
                Map<String, String> snapResult = midtransService.createSnapTransaction(booking);
                dto.setSnapToken(snapResult.get("token"));
                dto.setRedirectUrl(snapResult.get("redirect_url"));
                booking.setSnapToken(snapResult.get("token"));
                bookingRepository.save(booking);
            } catch (Exception e) {
                logger.error("Failed to create Midtrans token for booking {}: {}",
                        booking.getBookingReference(), e.getMessage());
            }
        }

        return dto;
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

    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, Long actingUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!isAdmin && !booking.getUser().getId().equals(actingUserId)) {
            throw new AccessDeniedException("You are not allowed to cancel this booking");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking already cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        if (booking.getEvent() != null && booking.getEvent().getId() != null) {
            Event event = eventRepository.findByIdForUpdate(booking.getEvent().getId())
                    .orElse(booking.getEvent());
            int restoredSeats = Math.min(event.getTotalSeats(),
                    event.getAvailableSeats() + booking.getNumberOfTickets());
            event.setAvailableSeats(restoredSeats);
            eventRepository.save(event);
        }
        bookingRepository.save(booking);
        return mapToDto(booking);
    }

    @Transactional
    public BookingResponseDTO confirmBookingAsStaff(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Booking already confirmed");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot confirm a cancelled booking");
        }
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentDate(java.time.LocalDateTime.now());
        if (booking.getPaymentType() == null || booking.getPaymentType().isBlank()) {
            booking.setPaymentType("manual_staff_confirm");
        }
        bookingRepository.save(booking);
        return mapToDto(booking);
    }

    private BookingResponseDTO mapToDto(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        dto.setEventTitle(booking.getEvent().getTitle());
        dto.setVenue(booking.getEvent().getVenue());
        dto.setEventDate(booking.getEvent().getEventDate());
        dto.setNumberOfTickets(booking.getNumberOfTickets());
        dto.setTotalAmount(booking.getTotalAmount() != null ? booking.getTotalAmount().doubleValue() : null);
        dto.setStatus(booking.getStatus() != null ? booking.getStatus().toString() : null);
        dto.setImageUrl(booking.getEvent() != null ? booking.getEvent().getImageUrl() : null);
        dto.setSnapToken(booking.getSnapToken());
        dto.setBookingDate(booking.getBookingDate());
        return dto;
    }

    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
