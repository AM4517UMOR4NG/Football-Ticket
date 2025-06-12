package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.MatchDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MatchService {

    private List<MatchDTO> matches = new ArrayList<>();

    public List<MatchDTO> getAllMatches() {
        // Logika untuk mengambil semua pertandingan (misalnya dari database)
        return matches;
    }

    public MatchDTO getMatchById(Long id) {
        // Logika untuk mengambil pertandingan berdasarkan ID
        return matches.stream().filter(m -> m.id().equals(id)).findFirst().orElse(null);
    }

    public MatchDTO createMatch(MatchDTO matchDTO) {
        // Logika untuk menyimpan pertandingan baru (misalnya ke database)
        matches.add(matchDTO);
        return matchDTO;
    }
}