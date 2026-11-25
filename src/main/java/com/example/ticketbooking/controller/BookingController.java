package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.BookingResponseDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.service.BookingService;
import com.example.ticketbooking.service.QrCodeService;
import com.example.ticketbooking.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private QrCodeService qrCodeService;

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequestDTO,
            BindingResult result,
            @RequestParam(required = false) Long userId) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldErrors().stream()
                    .map(error -> error.getField() + ": " + error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest().body(errorMessage);
        }

        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        if (userId != null && !userId.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Cannot create bookings for another user"));
        }

        try {
            BookingResponseDTO response = bookingService.createBooking(bookingRequestDTO, currentUser.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create booking: " + e.getMessage());
        }
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId,
            @RequestParam(required = false) Long userId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole());
        if (userId != null && !isAdmin && !userId.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Forbidden", "Cannot cancel bookings for another user"));
        }

        try {
            BookingResponseDTO response = bookingService.cancelBooking(bookingId, currentUser.getId(), isAdmin);
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse("Forbidden", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to cancel booking", e.getMessage()));
        }
    }

    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASHIER')")
    public ResponseEntity<?> confirmBooking(@PathVariable Long bookingId) {
        try {
            BookingResponseDTO response = bookingService.confirmBookingAsStaff(bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error confirming booking: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed to confirm booking", e.getMessage()));
        }
    }

    static class ErrorResponse {
        public String error;
        public String detail;

        public ErrorResponse(String error, String detail) {
            this.error = error;
            this.detail = detail;
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        boolean isPrivileged = "ADMIN".equalsIgnoreCase(currentUser.getRole())
                || "CASHIER".equalsIgnoreCase(currentUser.getRole());
        if (!isPrivileged && !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not allowed to access another user's bookings"));
        }

        try {
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching bookings for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to fetch bookings: " + e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getCurrentUserBookings() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        try {
            List<BookingResponseDTO> bookings = bookingService.getUserBookings(currentUser.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching current user bookings: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch bookings: " + e.getMessage()));
        }
    }

    @GetMapping("/{bookingReference}/qr")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getBookingQrCode(@PathVariable String bookingReference,
            @RequestParam(defaultValue = "240") int size) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingReference);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        boolean isPrivileged = "ADMIN".equalsIgnoreCase(currentUser.getRole())
                || "CASHIER".equalsIgnoreCase(currentUser.getRole());
        if (!isPrivileged && (booking.getUser() == null || !currentUser.getId().equals(booking.getUser().getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not allowed to access this ticket QR code"));
        }

        String payload = qrCodeService.buildTicketPayload(booking);
        byte[] pngBytes = qrCodeService.generateQrCodePng(payload, size);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.noStore())
                .body(pngBytes);
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return userService.findByUsername(auth.getName()).orElse(null);
    }
}
