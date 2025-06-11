package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.model.User;
import com.example.ticketbooking.repository.MatchRepository;
import com.example.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final UserRepository userRepository;
    private final MatchRepository matchRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository, MatchRepository matchRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public CommandLineRunner initDatabase() {
        return args -> {
            if (userRepository.findByUsername("admin") == null) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@example.com");
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }

            if (matchRepository.count() == 0) {
                Match match = new Match();
                match.setHomeTeam("Team A");
                match.setAwayTeam("Team B");
                match.setDate(java.sql.Date.valueOf("2025-06-12"));
                match.setTime(java.sql.Time.valueOf("14:00:00"));
                match.setVenue("Stadium X");
                match.setTotalTickets(100);
                match.setAvailableTickets(100);
                match.setPricePerTicket(50.0);
                matchRepository.save(match);
            }
        };
    }
}