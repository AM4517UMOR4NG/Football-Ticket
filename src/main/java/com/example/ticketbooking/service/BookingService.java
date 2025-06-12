package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public BookingResponseDTO createBooking(Long userId, BookingRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Pengguna tidak ditemukan"));
        
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Acara tidak ditemukan"));
        
        if (event.getAvailableSeats() < request.getNumberOfTickets()) {
            throw new RuntimeException("Kursi yang tersedia tidak cukup");
        }
        
        // Update jumlah kursi yang tersedia
        event.setAvailableSeats(event.getAvailableSeats() - request.getNumberOfTickets());
        eventRepository.save(event);
        
        // Buat pemesanan
        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setUser(user);
        booking.setEvent(event);
        booking.setNumberOfTickets(request.getNumberOfTickets());
        booking.setTotalAmount(event.getPrice().multiply(BigDecimal.valueOf(request.getNumberOfTickets())));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        
        booking = bookingRepository.save(booking);
        
        return mapToResponseDTO(booking);
    }
    
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToResponseDTO)
                .toList();
    }
    
    public BookingResponseDTO getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Pemesanan tidak ditemukan"));
        return mapToResponseDTO(booking);
    }
    
    private String generateBookingReference() {
        return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setBookingReference(booking.getBookingReference());
        dto.setEventTitle(booking.getEvent().getTitle());
        dto.setVenue(booking.getEvent().getVenue());
        dto.setEventDate(booking.getEvent().getEventDate());
        dto.setNumberOfTickets(booking.getNumberOfTickets());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setStatus(booking.getStatus().name());
        dto.setBookingDate(booking.getBookingDate());
        return dto;
    }
}