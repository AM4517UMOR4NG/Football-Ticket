package com.example.ticketbooking.controller;

import com.example.ticketbooking.service.EventService;
import com.example.ticketbooking.service.LeagueService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/about")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AboutController {

    private static final Logger logger = LoggerFactory.getLogger(AboutController.class);

    private final EventService eventService;
    private final LeagueService leagueService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCompanyStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            // Get basic statistics
            stats.put("totalEvents", eventService.getAllEvents().size());
            stats.put("totalLeagues", leagueService.getAllLeagues().size());
            stats.put("activeLeagues", leagueService.getActiveLeagues().size());

            // Company information
            Map<String, Object> companyInfo = new HashMap<>();
            companyInfo.put("name", "FootballTix");
            companyInfo.put("founded", "2023");
            companyInfo.put("headquarters", "Indonesia, West Papua");
            companyInfo.put("mission", "To provide the best football ticketing experience worldwide");
            companyInfo.put("vision", "To become the leading platform for football fans globally");

            stats.put("companyInfo", companyInfo);

            // Contact information
            Map<String, Object> contactInfo = new HashMap<>();
            contactInfo.put("email", "support@footballtix.com");
            contactInfo.put("phone", "+44 123 456 7890");
            contactInfo.put("address", "123 Stadium Street, London, UK");
            contactInfo.put("website", "www.footballtix.com");

            stats.put("contactInfo", contactInfo);

            // Social media
            Map<String, Object> socialMedia = new HashMap<>();
            socialMedia.put("facebook", "facebook.com/footballtix");
            socialMedia.put("twitter", "twitter.com/footballtix");
            socialMedia.put("instagram", "instagram.com/footballtix");
            socialMedia.put("linkedin", "linkedin.com/company/footballtix");

            stats.put("socialMedia", socialMedia);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error fetching company stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> getTeamInfo() {
        try {
            Map<String, Object> teamInfo = new HashMap<>();

            // Team members
            java.util.List<Map<String, Object>> team = new java.util.ArrayList<>();

            Map<String, Object> member1 = new HashMap<>();
            member1.put("name", "Aek Situmorang");
            member1.put("position", "CEO & Founder");
            member1.put("bio", "Former professional footballer (da goat)");
            member1.put("image", "");
            team.add(member1);

            Map<String, Object> member2 = new HashMap<>();
            member2.put("name", "Johnson Mobile Leged");
            member2.put("position", "CTO");
            member2.put("bio", "Technology expert with deep knowledge in e-commerce and ticketing systems");
            member2.put("image", "/images/team/johnson ml.jpg");
            team.add(member2);

            Map<String, Object> member3 = new HashMap<>();
            member3.put("name", "Siuu Brown");
            member3.put("position", "Head of Operations");
            member3.put("bio", "Operations specialist with extensive experience in event management");
            member3.put("image", "/images/team/siuubrown.jpg");
            team.add(member3);

            Map<String, Object> member4 = new HashMap<>();
            member4.put("name", "Emma Waduh");
            member4.put("position", "Head of Customer Success");
            member4.put("bio", "Customer experience expert dedicated to ensuring fan satisfaction");
            member4.put("image", "/images/team/emma-waduh.jpg");
            team.add(member4);

            teamInfo.put("team", team);
            teamInfo.put("totalMembers", team.size());

            return ResponseEntity.ok(teamInfo);
        } catch (Exception e) {
            logger.error("Error fetching team info: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/values")
    public ResponseEntity<Map<String, Object>> getCompanyValues() {
        try {
            Map<String, Object> values = new HashMap<>();

            java.util.List<Map<String, Object>> companyValues = new java.util.ArrayList<>();

            Map<String, Object> value1 = new HashMap<>();
            value1.put("title", "Fan First");
            value1.put("description", "We prioritize the fan experience above everything else");
            value1.put("icon", "heart");
            companyValues.add(value1);

            Map<String, Object> value2 = new HashMap<>();
            value2.put("title", "Innovation");
            value2.put("description", "Constantly improving our platform with cutting-edge technology");
            value2.put("icon", "lightbulb");
            companyValues.add(value2);

            Map<String, Object> value3 = new HashMap<>();
            value3.put("title", "Integrity");
            value3.put("description", "Transparent and honest in all our dealings");
            value3.put("icon", "shield");
            companyValues.add(value3);

            Map<String, Object> value4 = new HashMap<>();
            value4.put("title", "Excellence");
            value4.put("description", "Striving for excellence in every aspect of our service");
            value4.put("icon", "star");
            companyValues.add(value4);

            values.put("values", companyValues);

            return ResponseEntity.ok(values);
        } catch (Exception e) {
            logger.error("Error fetching company values: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}