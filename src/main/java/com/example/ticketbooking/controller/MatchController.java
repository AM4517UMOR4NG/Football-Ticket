package com.example.ticketbooking.controller;

import com.example.ticketbooking.entity.Match;
import com.example.ticketbooking.entity.MatchCategory;
import com.example.ticketbooking.entity.MatchStatus;
import com.example.ticketbooking.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/admin/matches")
public class MatchController {
    
    @Autowired
    private MatchService matchService;
    
    // ==== LIST ====
    @GetMapping
    public String adminMatchList(Model model, Authentication authentication) {
        List<Match> matches = matchService.getAllMatches();
        model.addAttribute("matches", matches);
        model.addAttribute("totalMatches", matchService.getTotalMatches());
        model.addAttribute("scheduledMatches", matchService.getScheduledMatchesCount());
        model.addAttribute("totalTicketsSold", matchService.getTotalTicketsSold());
        model.addAttribute("averagePrice", matchService.getAverageTicketPrice());
        return "admin/match-list";
    }
    
    // ==== CREATE ====
    @GetMapping("/create")
    public String showCreateForm(Model model) {
        model.addAttribute("match", new Match());
        model.addAttribute("categories", MatchCategory.values());
        model.addAttribute("statuses", MatchStatus.values());
        return "admin/match-form";
    }

    @PostMapping("/create")
    public String createMatch(@Valid @ModelAttribute("match") Match match,
                              BindingResult result,
                              RedirectAttributes redirectAttrs,
                              Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", MatchCategory.values());
            model.addAttribute("statuses", MatchStatus.values());
            return "admin/match-form";
        }
        matchService.save(match);
        redirectAttrs.addFlashAttribute("success", "Match created successfully!");
        return "redirect:/admin/matches";
    }
    
    // ==== EDIT ====
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttrs) {
        Match match = matchService.findById(id);
        if (match == null) {
            redirectAttrs.addFlashAttribute("error", "Match not found.");
            return "redirect:/admin/matches";
        }
        model.addAttribute("match", match);
        model.addAttribute("categories", MatchCategory.values());
        model.addAttribute("statuses", MatchStatus.values());
        return "admin/match-form";
    }

    @PostMapping("/edit/{id}")
    public String updateMatch(@PathVariable Long id,
                              @Valid @ModelAttribute("match") Match match,
                              BindingResult result,
                              RedirectAttributes redirectAttrs,
                              Model model) {
        if (result.hasErrors()) {
            model.addAttribute("categories", MatchCategory.values());
            model.addAttribute("statuses", MatchStatus.values());
            return "admin/match-form";
        }
        match.setId(id);
        matchService.save(match);
        redirectAttrs.addFlashAttribute("success", "Match updated successfully!");
        return "redirect:/admin/matches";
    }

    // ==== DELETE ====
    @GetMapping("/delete/{id}")
    public String deleteMatch(@PathVariable Long id, RedirectAttributes redirectAttrs) {
        boolean deleted = matchService.deleteById(id);
        if (deleted) {
            redirectAttrs.addFlashAttribute("success", "Match deleted successfully.");
        } else {
            redirectAttrs.addFlashAttribute("error", "Match not found.");
        }
        return "redirect:/admin/matches";
    }
}
