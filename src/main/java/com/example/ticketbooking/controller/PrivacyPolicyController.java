package com.example.ticketbooking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@Controller
public class PrivacyPolicyController {

    @GetMapping("/privacypolicy")
    public String showPrivacyPolicyPage() {
        return "privacypolicy";
    }

    @GetMapping("/api/privacy-policy/consent")
    @ResponseBody
    public ResponseEntity<String> updateCookieConsent() {
        try {
            // Be able to add logic to handle cookie consent
            return ResponseEntity.ok("Cookie consent updated successfully");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating cookie consent");
        }
    }

    @GetMapping("/api/privacy-policy/download")
    @ResponseBody
    public ResponseEntity<String> downloadPrivacyPolicy() {
        try {
            // Be able to add logic to generate downloadable privacy policy
            return ResponseEntity.ok("Privacy Policy download initiated");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading privacy policy");
        }
    }
}