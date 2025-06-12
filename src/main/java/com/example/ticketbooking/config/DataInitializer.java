package com.example.ticketbooking.config;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.service.EventService;
import com.example.ticketbooking.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserService userService;
    private final EventService eventService;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public DataInitializer(UserService userService, EventService eventService, UserRepository userRepository, EventRepository eventRepository) {
        this.userService = userService;
        this.eventService = eventService;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            createSampleUsers();
        }

        if (eventRepository.count() == 0) {
            createSampleEvents();
        }
    }

    private void createSampleUsers() {
        UserRegistrationDTO user1 = new UserRegistrationDTO(
                "john_doe", "john@example.com", "password123", "John Doe", "081234567890", "USER"
        );
        userService.registerUser(user1);

        UserRegistrationDTO user2 = new UserRegistrationDTO(
                "jane_smith", "jane@example.com", "password123", "Jane Smith", "081234567891", "USER"
        );
        userService.registerUser(user2);

        UserRegistrationDTO admin = new UserRegistrationDTO(
                "admin", "admin@example.com", "admin123", "Administrator", "081000000000", "ADMIN"
        );
        userService.registerUser(admin);
    }

    private void createSampleEvents() {
        EventDTO event1 = new EventDTO(
                "Concert Music Festival 2025",
                "Festival musik tahunan dengan artis ternama",
                "Jakarta Convention Center",
                LocalDateTime.now().plusDays(30),
                1000,
                new BigDecimal("150000")
        );
        eventService.createEvent(event1);

        EventDTO event2 = new EventDTO(
                "Football Match: Indonesia vs Malaysia",
                "Pertandingan persahabatan internasional",
                "Gelora Bung Karno Stadium",
                LocalDateTime.now().plusDays(15),
                80000,
                new BigDecimal("75000")
        );
        eventService.createEvent(event2);

        EventDTO event3 = new EventDTO(
                "Tech Conference 2025",
                "Konferensi teknologi tahunan dengan pakar industri",
                "Balai Kartini",
                LocalDateTime.now().plusDays(45),
                500,
                new BigDecimal("200000")
        );
        eventService.createEvent(event3);
    }
}