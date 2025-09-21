package com.example.ticketbooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "leagues")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class League {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String country;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "total_teams")
    private Integer totalTeams;

    @Column(name = "season_start")
    private String seasonStart;

    @Column(name = "season_end")
    private String seasonEnd;

    @Enumerated(EnumType.STRING)
    private LeagueStatus status = LeagueStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "league", cascade = CascadeType.ALL)
    private List<Event> events;

    public enum LeagueStatus {
        ACTIVE, INACTIVE, SEASON_ENDED
    }
}