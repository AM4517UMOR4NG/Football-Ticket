package com.example.ticketbooking;

import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "midtrans.server-key=test-midtrans-server-key",
        "midtrans.client-key=",
        "app.payments.allow-simulation=false",
        "app.rate-limit.max-requests-per-minute=200",
        "app.rate-limit.max-requests-per-hour=1000"
})
@AutoConfigureMockMvc
class SecurityHardeningTests {

    private static final String TEST_MIDTRANS_SERVER_KEY = "test-midtrans-server-key";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void publicRegistrationForcesUserRoleEvenWhenAdminRequested() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 6);
        String username = "secuser_" + suffix;
        String email = username + "@example.com";

        String registerPayload = objectMapper.writeValueAsString(Map.of(
                "username", username,
                "email", email,
                "password", "Strong#Pass92",
                "fullName", "Security Test User",
                "phoneNumber", "08123456789",
                "role", "ADMIN"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        User created = userRepository.findByUsername(username).orElseThrow();
        assertThat(created.getRole()).isEqualTo("USER");

        String userToken = loginAndGetToken(username, "Strong#Pass92");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void bookingIdorAndSelfConfirmAndSyncBypassAreBlocked() throws Exception {
        User alice = registerAndFetchUser("alice", "Strong#Pass92");
        User bob = registerAndFetchUser("bob", "Strong#Pass92");
        String aliceToken = loginAndGetToken(alice.getUsername(), "Strong#Pass92");
        String bobToken = loginAndGetToken(bob.getUsername(), "Strong#Pass92");
        String cashierToken = loginAndGetToken("cashier1", "Alogo.situ24");

        Event event = eventRepository.findAll().get(0);
        int seatsBefore = event.getAvailableSeats();

        String bookingBody = objectMapper.writeValueAsString(Map.of(
                "eventId", event.getId(),
                "numberOfTickets", 2
        ));

        // 1. Alice cannot create a booking on behalf of Bob via userId query param
        mockMvc.perform(post("/api/bookings")
                        .param("userId", String.valueOf(bob.getId()))
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingBody))
                .andExpect(status().isForbidden());

        // 2. Alice creates her own booking (status must start as PENDING)
        MvcResult createRes = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn();

        JsonNode createdBooking = objectMapper.readTree(createRes.getResponse().getContentAsString());
        long bookingId = createdBooking.get("id").asLong();
        String bookingRef = createdBooking.get("bookingReference").asText();

        assertThat(eventRepository.findById(event.getId()).orElseThrow().getAvailableSeats())
                .isEqualTo(seatsBefore - 2);

        // 3. Bob cannot view Alice's bookings or payment status
        mockMvc.perform(get("/api/bookings/user/" + alice.getId())
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/payments/status/" + bookingRef)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());

        // 4. Bob cannot cancel Alice's booking (with or without forged userId)
        mockMvc.perform(post("/api/bookings/" + bookingId + "/cancel")
                        .param("userId", String.valueOf(alice.getId()))
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());

        // 5. Regular user cannot self-confirm unpaid booking
        mockMvc.perform(post("/api/bookings/" + bookingId + "/confirm")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isForbidden());

        // 6. Unauthenticated and cross-user sync-status blocked; owner sync-status never falls back to CONFIRMED
        mockMvc.perform(post("/api/payments/sync-status/" + bookingRef))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/payments/sync-status/" + bookingRef)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/payments/sync-status/" + bookingRef)
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("PENDING"));

        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus())
                .isEqualTo(Booking.BookingStatus.PENDING);

        // 7. Cashier can confirm booking legitimately
        mockMvc.perform(post("/api/bookings/" + bookingId + "/confirm")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // 8. Alice can cancel her own booking and availableSeats are restored
        mockMvc.perform(post("/api/bookings/" + bookingId + "/cancel")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        assertThat(eventRepository.findById(event.getId()).orElseThrow().getAvailableSeats())
                .isEqualTo(seatsBefore);
    }

    @Test
    void midtransWebhookEnforcesSha512SignatureAndAmountIntegrity() throws Exception {
        User buyer = registerAndFetchUser("buyer", "Strong#Pass92");
        String buyerToken = loginAndGetToken(buyer.getUsername(), "Strong#Pass92");
        Event event = eventRepository.findAll().get(0);

        String bookingBody = objectMapper.writeValueAsString(Map.of(
                "eventId", event.getId(),
                "numberOfTickets", 1
        ));

        MvcResult createRes = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingBody))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode created = objectMapper.readTree(createRes.getResponse().getContentAsString());
        long bookingId = created.get("id").asLong();
        String orderId = created.get("bookingReference").asText();
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        String exactAmount = booking.getTotalAmount().toPlainString();

        // 1. Missing signature_key -> 400
        mockMvc.perform(post("/api/payments/notification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "order_id", orderId,
                                "status_code", "200",
                                "gross_amount", exactAmount,
                                "transaction_status", "settlement"
                        ))))
                .andExpect(status().isBadRequest());

        // 2. Forged signature_key -> 403
        mockMvc.perform(post("/api/payments/notification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "order_id", orderId,
                                "status_code", "200",
                                "gross_amount", exactAmount,
                                "signature_key", "0000forgedsignature",
                                "transaction_status", "settlement",
                                "payment_type", "gopay"
                        ))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value("invalid_signature"));

        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus())
                .isEqualTo(Booking.BookingStatus.PENDING);

        // 3. Valid signature but tampered gross_amount -> 400
        String tamperedAmount = "1.00";
        String tamperedSig = sha512Hex(orderId + "200" + tamperedAmount + TEST_MIDTRANS_SERVER_KEY);
        mockMvc.perform(post("/api/payments/notification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "order_id", orderId,
                                "status_code", "200",
                                "gross_amount", tamperedAmount,
                                "signature_key", tamperedSig,
                                "transaction_status", "settlement",
                                "payment_type", "gopay"
                        ))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("amount_mismatch"));

        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus())
                .isEqualTo(Booking.BookingStatus.PENDING);

        // 4. Valid SHA-512 signature + exact amount + settlement -> 200 & CONFIRMED
        String validSig = sha512Hex(orderId + "200" + exactAmount + TEST_MIDTRANS_SERVER_KEY);
        mockMvc.perform(post("/api/payments/notification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "order_id", orderId,
                                "status_code", "200",
                                "gross_amount", exactAmount,
                                "signature_key", validSig,
                                "transaction_status", "settlement",
                                "payment_type", "qris"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));

        Booking confirmed = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(confirmed.getStatus()).isEqualTo(Booking.BookingStatus.CONFIRMED);
        assertThat(confirmed.getPaymentType()).isEqualTo("qris");
    }

    @Test
    void rbacRestrictsEventLeagueMutationsPublicCashierAndAdminDeletion() throws Exception {
        User normalUser = registerAndFetchUser("rbac", "Strong#Pass92");
        String userToken = loginAndGetToken(normalUser.getUsername(), "Strong#Pass92");
        String cashierToken = loginAndGetToken("cashier1", "Alogo.situ24");
        String adminToken = loginAndGetToken("Alogo12", "Alogo.situ24");

        // Unauthenticated and regular USER blocked from /api/public/cashier/bookings
        mockMvc.perform(get("/api/public/cashier/bookings"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/public/cashier/bookings")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Cashier allowed on /api/public/cashier/bookings
        mockMvc.perform(get("/api/public/cashier/bookings")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk());

        // Regular USER cannot mutate events or leagues
        mockMvc.perform(post("/api/events")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hack Match\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/events/1")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/leagues")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hack League\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/leagues/1")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        // Admin cannot delete ADMIN account via admin dashboard delete endpoint
        User admin = userRepository.findByUsername("Alogo12").orElseThrow();
        mockMvc.perform(delete("/api/admin/users/" + admin.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedAndMalformedJwtAndUnknownEndpointsAreRejectedWithSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/auth/verify"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/bookings/my-bookings")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/nonexistent-endpoint"))
                .andExpect(status().isUnauthorized());

        // Login failure returns generic message without leaking internal exception detail + security headers
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"Alogo12\",\"password\":\"Wrong#Pass99\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    private User registerAndFetchUser(String prefix, String password) throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 6);
        String username = prefix + "_" + suffix;
        String payload = objectMapper.writeValueAsString(Map.of(
                "username", username,
                "email", username + "@example.com",
                "password", password,
                "fullName", prefix + " Tester",
                "phoneNumber", "08123456780"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        return userRepository.findByUsername(username).orElseThrow();
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", username,
                                "password", password
                        ))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .get("accessToken").asText();
    }

    private String sha512Hex(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-512");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
