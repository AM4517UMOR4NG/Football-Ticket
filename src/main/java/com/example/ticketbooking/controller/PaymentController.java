package com.example.ticketbooking.controller;

import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.security.SecurityAuditService;
import com.example.ticketbooking.service.MidtransService;
import com.example.ticketbooking.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private MidtransService midtransService;

    @Autowired
    private UserService userService;

    @Autowired
    private SecurityAuditService securityAuditService;

    @Value("${midtrans.server-key:}")
    private String serverKey;

    @Value("${app.payments.allow-simulation:false}")
    private boolean allowSimulation;

    /**
     * Serve the Midtrans client key to the frontend.
     */
    @GetMapping("/client-key")
    public ResponseEntity<?> getClientKey() {
        return ResponseEntity.ok(Map.of(
                "clientKey", midtransService.getClientKey() != null ? midtransService.getClientKey() : "",
                "configured", midtransService.isConfigured()));
    }

    /**
     * Handle Midtrans webhook/notification callback with strict SHA-512 signature & gross_amount verification.
     */
    @PostMapping("/notification")
    @Transactional
    public ResponseEntity<?> handleNotification(@RequestBody Map<String, Object> payload,
            HttpServletRequest request) {
        if (serverKey == null || serverKey.isBlank()) {
            logger.warn("Midtrans notification rejected: midtrans.server-key is not configured");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Collections.singletonMap("status", "payment_gateway_not_configured"));
        }

        String orderId = asString(payload.get("order_id"));
        String statusCode = asString(payload.get("status_code"));
        String grossAmount = asString(payload.get("gross_amount"));
        String signatureKey = asString(payload.get("signature_key"));
        String transactionStatus = asString(payload.get("transaction_status"));
        String fraudStatus = asString(payload.get("fraud_status"));
        String paymentType = asString(payload.get("payment_type"));

        if (orderId.isBlank() || statusCode.isBlank() || grossAmount.isBlank()
                || signatureKey.isBlank() || transactionStatus.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("status", "invalid_payload"));
        }

        if (!isValidMidtransSignature(orderId, statusCode, grossAmount, signatureKey)) {
            securityAuditService.logSuspiciousActivity(
                    "MIDTRANS_INVALID_SIGNATURE",
                    request.getRemoteAddr(),
                    "orderId=" + orderId);
            logger.warn("Rejected Midtrans notification with invalid signature for orderId: {}", orderId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("status", "invalid_signature"));
        }

        logger.info("Verified Midtrans notification - orderId: {}, status: {}, fraud: {}, payment: {}",
                orderId, transactionStatus, fraudStatus, paymentType);

        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(orderId);
        if (bookingOpt.isEmpty()) {
            logger.warn("Booking not found for orderId: {}", orderId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("status", "booking_not_found"));
        }

        Booking booking = bookingOpt.get();

        // Verify gross_amount matches booking totalAmount
        try {
            BigDecimal notifiedAmount = new BigDecimal(grossAmount);
            if (booking.getTotalAmount() == null || notifiedAmount.compareTo(booking.getTotalAmount()) != 0) {
                securityAuditService.logSuspiciousActivity(
                        "MIDTRANS_AMOUNT_MISMATCH",
                        request.getRemoteAddr(),
                        "orderId=" + orderId + ", expected=" + booking.getTotalAmount() + ", received=" + grossAmount);
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("status", "amount_mismatch"));
            }
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("status", "invalid_amount"));
        }

        applyMidtransTransactionStatus(booking, transactionStatus, fraudStatus, paymentType);
        bookingRepository.save(booking);

        return ResponseEntity.ok(Collections.singletonMap("status", "ok"));
    }

    /**
     * Authenticated owner or staff can check booking payment status from DB.
     */
    @GetMapping("/status/{bookingReference}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String bookingReference) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingReference);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        if (!canAccessBooking(currentUser, booking)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not allowed to view this payment status"));
        }

        Map<String, Object> status = Map.of(
                "bookingReference", booking.getBookingReference(),
                "status", booking.getStatus().toString(),
                "paymentType", booking.getPaymentType() != null ? booking.getPaymentType() : "",
                "paymentDate", booking.getPaymentDate() != null ? booking.getPaymentDate().toString() : "");
        return ResponseEntity.ok(status);
    }

    /**
     * Sync transaction status directly from Midtrans Core API for the booking owner or staff.
     * Never auto-confirms pending transactions or API failures.
     */
    @PostMapping("/sync-status/{orderId}")
    @Transactional
    public ResponseEntity<?> syncStatus(@PathVariable String orderId) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(orderId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Booking booking = bookingOpt.get();
        if (!canAccessBooking(currentUser, booking)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not allowed to sync payment status for this booking"));
        }

        if (!midtransService.isConfigured()) {
            if (allowSimulation && booking.getStatus() == Booking.BookingStatus.PENDING) {
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                booking.setPaymentDate(LocalDateTime.now());
                booking.setPaymentType("dev_simulation");
                bookingRepository.save(booking);
                logger.info("Booking {} confirmed via explicit dev simulation mode", orderId);
                return ResponseEntity.ok(Collections.singletonMap("status", booking.getStatus().toString()));
            }
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                            "error", "Payment gateway is not configured",
                            "status", booking.getStatus().toString()));
        }

        try {
            JSONObject midtransStatus = midtransService.checkTransactionStatus(orderId);

            String transactionStatus = midtransStatus.optString("transaction_status", "");
            String fraudStatus = midtransStatus.optString("fraud_status", "");
            String paymentType = midtransStatus.optString("payment_type", "midtrans");

            logger.info("Syncing Midtrans status for order {}: transaction_status={}, fraud_status={}",
                    orderId, transactionStatus, fraudStatus);

            applyMidtransTransactionStatus(booking, transactionStatus, fraudStatus, paymentType);
            bookingRepository.save(booking);

            return ResponseEntity.ok(Collections.singletonMap("status", booking.getStatus().toString()));
        } catch (Exception e) {
            logger.error("Error syncing Midtrans status for order {}: {}", orderId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "error", "Unable to verify payment status with Midtrans",
                            "status", booking.getStatus().toString()));
        }
    }

    private void applyMidtransTransactionStatus(Booking booking, String transactionStatus,
            String fraudStatus, String paymentType) {
        switch (transactionStatus.toLowerCase(Locale.ROOT)) {
            case "capture":
                if ("accept".equalsIgnoreCase(fraudStatus)) {
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                    booking.setPaymentDate(LocalDateTime.now());
                    booking.setPaymentType(paymentType);
                } else if ("deny".equalsIgnoreCase(fraudStatus)) {
                    cancelAndRestoreSeats(booking);
                } else {
                    booking.setStatus(Booking.BookingStatus.PENDING);
                    booking.setPaymentType(paymentType);
                }
                break;
            case "settlement":
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                booking.setPaymentDate(LocalDateTime.now());
                booking.setPaymentType(paymentType);
                break;
            case "pending":
                if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
                    booking.setStatus(Booking.BookingStatus.PENDING);
                    booking.setPaymentType(paymentType);
                }
                break;
            case "deny":
            case "cancel":
            case "expire":
                cancelAndRestoreSeats(booking);
                break;
            default:
                logger.warn("Ignored unknown Midtrans transaction_status '{}' for order {}",
                        transactionStatus, booking.getBookingReference());
        }
    }

    private void cancelAndRestoreSeats(Booking booking) {
        if (booking.getStatus() != Booking.BookingStatus.CANCELLED) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            if (booking.getEvent() != null && booking.getEvent().getId() != null) {
                Event event = eventRepository.findByIdForUpdate(booking.getEvent().getId())
                        .orElse(booking.getEvent());
                int restoredSeats = Math.min(event.getTotalSeats(),
                        event.getAvailableSeats() + booking.getNumberOfTickets());
                event.setAvailableSeats(restoredSeats);
                eventRepository.save(event);
            }
        }
    }

    private boolean isValidMidtransSignature(String orderId, String statusCode,
            String grossAmount, String providedSignature) {
        String raw = orderId + statusCode + grossAmount + serverKey;
        String expected = sha512Hex(raw);
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                providedSignature.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
    }

    private String sha512Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-512 algorithm unavailable", e);
        }
    }

    private boolean canAccessBooking(User user, Booking booking) {
        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "CASHIER".equalsIgnoreCase(user.getRole())) {
            return true;
        }
        return booking.getUser() != null && user.getId().equals(booking.getUser().getId());
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return userService.findByUsername(auth.getName()).orElse(null);
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}
