package com.example.ticketbooking.config;

import com.example.ticketbooking.dto.EventDTO;
import com.example.ticketbooking.repository.EventRepository;
import com.example.ticketbooking.service.EventService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

        private final EventService eventService;
        private final EventRepository eventRepository;

        public DataInitializer(EventService eventService, EventRepository eventRepository) {
                this.eventService = eventService;
                this.eventRepository = eventRepository;
        }

        @Override
        public void run(String... args) throws Exception {
                // Admin user is now created in UserService.initDefaultAdmin()
                if (eventRepository.count() == 0) {
                        createFootballEvents();
                }
        }

        private void createFootballEvents() {
                // Event 1: Pertandingan Timnas Indonesia
                EventDTO event1 = new EventDTO(
                                null,
                                "Indonesia vs Thailand - Piala AFF 2025",
                                "Pertandingan final Piala AFF 2025 antara Indonesia melawan Thailand. " +
                                                "Saksikan aksi Egy Maulana Vikri, Witan Sulaeman, dan Marselino Ferdinan "
                                                +
                                                "membela Garuda di kandang sendiri!. "
                                                +
                                                "Dukung Timnas Indonesia meraih gelar juara AFF pertama sejak 2016!. ",
                                "Stadion Utama Gelora Bung Karno",
                                LocalDateTime.now().plusDays(20),
                                20,
                                new BigDecimal("125000"));
                eventService.createEvent(event1);

                // Event 2: Friendly Match
                EventDTO event2 = new EventDTO(
                                null,
                                "Indonesia vs Argentina - International Friendly",
                                "Pertandingan persahabatan internasional yang mempertemukan Timnas Indonesia " +
                                                "dengan Argentina yang diperkuat Lionel Messi. Kesempatan langka menyaksikan "
                                                +
                                                "legenda sepak bola dunia bertanding di Indonesia!",
                                "Stadion Manahan Solo",
                                LocalDateTime.now().plusDays(35),
                                40000,
                                new BigDecimal("275000"));
                eventService.createEvent(event2);

                // Event 3: Liga 1 Indonesia
                EventDTO event3 = new EventDTO(
                                null,
                                "Persija Jakarta vs Persib Bandung - Klasiko Indonesia",
                                "Pertandingan klasik Liga 1 Indonesia antara Persija Jakarta melawan Persib Bandung. " +
                                                "Derby paling ditunggu dengan atmosfer penuh passion dari The Jakmania dan Bobotoh. "
                                                +
                                                "Featuring Marc Klok dan Pratama Arhan!",
                                "Stadion Utama Gelora Bung Karno",
                                LocalDateTime.now().plusDays(12),
                                88000,
                                new BigDecimal("95000"));
                eventService.createEvent(event3);

                // Event 4: Exhibisi Match
                EventDTO event4 = new EventDTO(
                                null,
                                "Cristiano Ronaldo Exhibition Match",
                                "Pertandingan ekshibisi bintang dunia Cristiano Ronaldo melawan Tim All Star Indonesia. "
                                                +
                                                "Saksikan aksi CR7 dari jarak dekat dan bertemu dengan para pemain muda berbakat Indonesia. "
                                                +
                                                "Event sekali seumur hidup!. "
                                                +
                                                "Tunggu kehadiran anda, sepak bola dunia di Indonesia!",

                                "Stadion Gelora Bandung",
                                LocalDateTime.now().plusDays(50),
                                38000,
                                new BigDecimal("350000"));
                eventService.createEvent(event4);

                // Event 5: Youth Championship
                EventDTO event5 = new EventDTO(
                                null,
                                "Indonesia U-23 vs Malaysia U-23 - SEA Games 2025",
                                "Pertandingan sepak bola putra SEA Games 2025 antara Indonesia U-23 melawan Malaysia U-23. "
                                                +
                                                "Dukung generasi emas sepak bola Indonesia meraih medali emas di kandang sendiri. "
                                                +
                                                "Featuring future stars of Indonesian football!",
                                "Stadion Patriot Candrabhaga",
                                LocalDateTime.now().plusDays(28),
                                30000,
                                new BigDecimal("85000"));
                eventService.createEvent(event5);

                // Event 6: Neymar Showcase
                EventDTO event6 = new EventDTO(
                                null,
                                "Neymar Jr Skills & Goals Showcase",
                                "Acara showcase eksklusif dari Neymar Jr menampilkan skill terbaik dan gol-gol spektakuler. "
                                                +
                                                "Termasuk meet & greet session, photo opportunity, dan masterclass sepak bola. "
                                                +
                                                "Kesempatan terbatas bertemu dengan salah satu pemain terbaik dunia!",
                                "Stadion Kapten I Wayan Dipta",
                                LocalDateTime.now().plusDays(42),
                                15000,
                                new BigDecimal("450000"));
                eventService.createEvent(event6);

                System.out.println("Football events created successfully!");
        }
}