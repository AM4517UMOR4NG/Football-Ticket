package com.example.ticketbooking.dto;

import java.time.LocalDateTime;

public record LeagueDTO(
                Long id,
                String name,
                String description,
                String country,
                Integer foundedYear,
                String logoUrl,
                String bannerUrl,
                Integer totalTeams,
                String seasonStart,
                String seasonEnd,
                String status,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}