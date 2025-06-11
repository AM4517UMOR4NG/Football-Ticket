package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MatchService {
    @Autowired
    private MatchRepository repository;

    public List<Match> getAllMatches() {
        return repository.findAll();
    }

    public Match getMatchById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void saveMatch(Match match) {
        repository.save(match);
    }
}