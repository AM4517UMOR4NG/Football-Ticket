package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/matches")
public class MatchController {
    @Autowired
    private MatchService service;

    @GetMapping
    public List<Match> getAllMatches() {
        return service.getAllMatches();
    }

    @GetMapping("/{id}")
    public Match getMatchById(@PathVariable Long id) {
        return service.getMatchById(id);
    }
}