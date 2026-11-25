package com.example.ticketbooking;

import com.example.ticketbooking.dto.BookingRequestDTO;
import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.League;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.LeagueRepository;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.service.BookingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "midtrans.server-key=",
        "midtrans.client-key=",
        "app.rate-limit.max-requests-per-minute=200",
        "app.rate-limit.max-requests-per-hour=1000"
})
@AutoConfigureMockMvc
class FunctionalIntegrityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private LeagueRepository leagueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Test
    void concurrentBookingsNeverOversellAvailableSeats() throws Exception {
        User buyer = registerAndFetchUser("conc", "Strong#Pass92");

        Event limitedEvent = new Event();
        limitedEvent.setTitle("Final Derby Limited " + UUID.randomUUID().toString().substring(0, 6));
        limitedEvent.setDescription("Concurrency test match");
        limitedEvent.setVenue("Test Arena");
        limitedEvent.setEventDate(LocalDateTime.now().plusDays(10));
        limitedEvent.setTotalSeats(5);
        limitedEvent.setAvailableSeats(5);
        limitedEvent.setPrice(new BigDecimal("500000.00"));
        limitedEvent.setStatus(Event.EventStatus.ACTIVE);
        limitedEvent = eventRepository.save(limitedEvent);

        Long eventId = limitedEvent.getId();
        int threads = 8;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> {
                ready.countDown();
                try {
                    start.await(5, TimeUnit.SECONDS);
                    BookingRequestDTO req = new BookingRequestDTO();
                    req.setEventId(eventId);
                    req.setNumberOfTickets(2);
                    bookingService.createBooking(req, buyer.getId());
                    successCount.incrementAndGet();
                } catch (Exception ex) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
        start.countDown();
        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }
        executor.shutdownNow();

        Event afterEvent = eventRepository.findById(eventId).orElseThrow();
        // With 5 seats and 2 tickets per booking, at most 2 bookings (4 seats) can succeed, leaving 1 seat
        assertThat(successCount.get()).isEqualTo(2);
        assertThat(failureCount.get()).isEqualTo(threads - 2);
        assertThat(afterEvent.getAvailableSeats()).isEqualTo(1);
    }

    @Test
    void updateEventPreservesBookedSeatsAndRejectsShrinkingBelowBooked() throws Exception {
        User buyer = registerAndFetchUser("upd", "Strong#Pass92");
        String adminToken = loginAndGetToken("Alogo12", "Alogo.situ24");
        League league = leagueRepository.findAll().get(0);

        Event event = new Event();
        event.setTitle("Seat Preservation Match");
        event.setDescription("Initial description");
        event.setVenue("Main Stadium");
        event.setEventDate(LocalDateTime.now().plusDays(14));
        event.setTotalSeats(10);
        event.setAvailableSeats(10);
        event.setPrice(new BigDecimal("250000.00"));
        event.setLeague(league);
        event.setStatus(Event.EventStatus.ACTIVE);
        event = eventRepository.save(event);

        // Book 4 seats -> availableSeats becomes 6
        BookingRequestDTO req = new BookingRequestDTO();
        req.setEventId(event.getId());
        req.setNumberOfTickets(4);
        bookingService.createBooking(req, buyer.getId());

        // Attempt to shrink totalSeats to 3 (< 4 already booked) -> must fail with 400
        EventDTO shrinkDto = new EventDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                3,
                event.getPrice(),
                event.getImageUrl(),
                league.getId());

        mockMvc.perform(put("/api/events/" + event.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shrinkDto)))
                .andExpect(status().isBadRequest());

        assertThat(eventRepository.findById(event.getId()).orElseThrow().getAvailableSeats()).isEqualTo(6);

        // Expand totalSeats to 15 -> availableSeats must become 15 - 4 = 11 (NOT reset to 15)
        EventDTO expandDto = new EventDTO(
                event.getId(),
                "Seat Preservation Match Updated",
                event.getDescription(),
                event.getVenue(),
                event.getEventDate(),
                15,
                event.getPrice(),
                event.getImageUrl(),
                league.getId());

        mockMvc.perform(put("/api/events/" + event.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expandDto)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events/" + event.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSeats").value(15))
                .andExpect(jsonPath("$.availableSeats").value(11))
                .andExpect(jsonPath("$.leagueName").value(league.getName()));
    }

    @Test
    void cannotBookPastOrCancelledEvent() throws Exception {
        User buyer = registerAndFetchUser("past", "Strong#Pass92");
        String buyerToken = loginAndGetToken(buyer.getUsername(), "Strong#Pass92");

        Event pastEvent = new Event();
        pastEvent.setTitle("Past Match");
        pastEvent.setVenue("Old Stadium");
        pastEvent.setEventDate(LocalDateTime.now().minusDays(2));
        pastEvent.setTotalSeats(100);
        pastEvent.setAvailableSeats(100);
        pastEvent.setPrice(new BigDecimal("100000.00"));
        pastEvent.setStatus(Event.EventStatus.ACTIVE);
        pastEvent = eventRepository.save(pastEvent);

        Event cancelledEvent = new Event();
        cancelledEvent.setTitle("Cancelled Match");
        cancelledEvent.setVenue("Closed Stadium");
        cancelledEvent.setEventDate(LocalDateTime.now().plusDays(5));
        cancelledEvent.setTotalSeats(100);
        cancelledEvent.setAvailableSeats(100);
        cancelledEvent.setPrice(new BigDecimal("100000.00"));
        cancelledEvent.setStatus(Event.EventStatus.CANCELLED);
        cancelledEvent = eventRepository.save(cancelledEvent);

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("eventId", pastEvent.getId(), "numberOfTickets", 1))))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("eventId", cancelledEvent.getId(), "numberOfTickets", 1))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchSupportsLeagueFilterAndExposesAvailableSeats() throws Exception {
        mockMvc.perform(get("/api/events/search").param("league", "laliga"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].availableSeats").isNumber())
                .andExpect(jsonPath("$[0].leagueName").value("La Liga"));

        mockMvc.perform(get("/api/events/league/champions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].leagueName").value("UEFA Champions League"));
    }

    @Test
    void ticketQrEndpointReturnsScannableIsoQrCodeAndEnforcesOwnership() throws Exception {
        User owner = registerAndFetchUser("qrowner", "Strong#Pass92");
        User intruder = registerAndFetchUser("qrintruder", "Strong#Pass92");
        String ownerToken = loginAndGetToken(owner.getUsername(), "Strong#Pass92");
        String intruderToken = loginAndGetToken(intruder.getUsername(), "Strong#Pass92");
        String cashierToken = loginAndGetToken("cashier1", "Alogo.situ24");

        Event event = eventRepository.findAll().stream()
                .filter(e -> e.getStatus() == Event.EventStatus.ACTIVE && e.getEventDate().isAfter(LocalDateTime.now()) && e.getAvailableSeats() >= 2)
                .findFirst()
                .orElseThrow();

        MvcResult createRes = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("eventId", event.getId(), "numberOfTickets", 2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingDate").isNotEmpty())
                .andReturn();

        JsonNode bookingJson = objectMapper.readTree(createRes.getResponse().getContentAsString());
        String bookingRef = bookingJson.get("bookingReference").asText();

        // Another user cannot fetch owner's ticket QR
        mockMvc.perform(get("/api/bookings/" + bookingRef + "/qr")
                        .header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isForbidden());

        // Cashier can fetch QR for verification/printing
        mockMvc.perform(get("/api/bookings/" + bookingRef + "/qr")
                        .header("Authorization", "Bearer " + cashierToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG));

        // Owner fetches QR PNG and ZXing decodes it cleanly back to expected payload
        MvcResult qrRes = mockMvc.perform(get("/api/bookings/" + bookingRef + "/qr")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andReturn();

        byte[] pngBytes = qrRes.getResponse().getContentAsByteArray();
        BufferedImage img = ImageIO.read(new ByteArrayInputStream(pngBytes));
        assertThat(img).isNotNull();

        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(img)));
        Result decoded = new MultiFormatReader().decode(bitmap);
        Booking saved = bookingRepository.findByBookingReference(bookingRef).orElseThrow();
        assertThat(decoded.getText()).isEqualTo(
                "FOOTBALLTIX|REF:" + bookingRef + "|EVENT:" + saved.getEvent().getId() + "|QTY:2|STATUS:PENDING");
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
}
