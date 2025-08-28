package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeagueRepository extends JpaRepository<League, Long> {

    List<League> findByStatus(League.LeagueStatus status);

    List<League> findByCountry(String country);

    Optional<League> findByName(String name);

    @Query("SELECT l FROM League l WHERE l.status = 'ACTIVE' ORDER BY l.name")
    List<League> findActiveLeagues();

    @Query("SELECT l FROM League l WHERE l.name LIKE %:searchTerm% OR l.country LIKE %:searchTerm%")
    List<League> searchLeagues(String searchTerm);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.league.id = :leagueId")
    Long countEventsByLeagueId(Long leagueId);
}