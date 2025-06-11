package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Long> {
}