package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing Match entities.
 * Provides standard CRUD operations for Match objects.
 */
public interface MatchRepository extends JpaRepository<Match, Long> {
}