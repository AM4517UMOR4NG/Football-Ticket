package com.example.ticketbooking.controller;

import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.service.UserService;
import com.example.ticketbooking.dto.UserProfileDTO;
import com.example.ticketbooking.dto.UserUpdateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserProfileDTO profile = new UserProfileDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole(),
                    user.getPhone(),
                    user.getAddress(),
                    user.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateUserProfile(@RequestBody UserUpdateDTO updateDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update user fields
            if (updateDTO.fullName() != null) {
                user.setFullName(updateDTO.fullName());
            }
            if (updateDTO.email() != null) {
                user.setEmail(updateDTO.email());
            }
            if (updateDTO.phone() != null) {
                user.setPhone(updateDTO.phone());
            }
            if (updateDTO.address() != null) {
                user.setAddress(updateDTO.address());
            }

            User updatedUser = userService.updateUser(user);

            UserProfileDTO profile = new UserProfileDTO(
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    updatedUser.getFullName(),
                    updatedUser.getRole(),
                    updatedUser.getPhone(),
                    updatedUser.getAddress(),
                    updatedUser.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Current password and new password are required"));
            }

            boolean success = userService.changePassword(username, currentPassword, newPassword);

            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> stats = new HashMap<>();
            stats.put("userId", user.getId());
            stats.put("username", user.getUsername());
            stats.put("totalBookings", userService.getUserBookingCount(user.getId()));
            stats.put("activeBookings", userService.getUserActiveBookingCount(user.getId()));
            stats.put("totalSpent", userService.getUserTotalSpent(user.getId()));
            stats.put("memberSince", user.getCreatedAt());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // HTML page endpoints
    @GetMapping("/page")
    public String getUserProfilePage() {
        return "forward:/profile.html";
    }

    @GetMapping("/admin/page")
    public String getAdminProfilePage() {
        return "forward:/admin-profile.html";
    }
}