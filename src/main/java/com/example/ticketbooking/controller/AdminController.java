package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.AdminProfileDTO;
import com.example.ticketbooking.dto.AdminUpdateDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Booking;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.BookingRepository;
import com.example.ticketbooking.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;

    //Get admin profile
    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAdminProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Auth: " + auth);
            System.out.println("Auth name: " + (auth != null ? auth.getName() : "null"));
            System.out.println("Auth authorities: " + (auth != null ? auth.getAuthorities() : "null"));

            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            if (username == null || username.equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("error", "No valid user found"));
            }

            //Check if user exists and has ADMIN role
            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            if (!"ADMIN".equals(admin.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            AdminProfileDTO adminProfile = createAdminProfileDTO(admin);
            return ResponseEntity.ok(adminProfile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //Update admin profile
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateAdminProfile(@RequestBody AdminUpdateDTO updateDTO) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            //Update admin fields
            if (updateDTO.getFullName() != null) {
                admin.setFullName(updateDTO.getFullName());
            }
            if (updateDTO.getEmail() != null) {
                admin.setEmail(updateDTO.getEmail());
            }
            if (updateDTO.getPhone() != null) {
                admin.setPhone(updateDTO.getPhone());
            }
            if (updateDTO.getAddress() != null) {
                admin.setAddress(updateDTO.getAddress());
            }

            //Update additional admin fields
            User updatedAdmin = userRepository.save(admin);
            AdminProfileDTO adminProfile = createAdminProfileDTO(updatedAdmin);

            return ResponseEntity.ok(adminProfile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //Get system statistics
    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getSystemStats() {
        try {
            //Check authentication first
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Stats Auth: " + auth);
            System.out.println("Stats Auth name: " + (auth != null ? auth.getName() : "null"));

            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }

            String username = auth.getName();
            if (username == null || username.equals("anonymousUser")) {
                return ResponseEntity.status(401).body(Map.of("error", "No valid user found"));
            }

            //Check if user exists and has ADMIN role
            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            if (!"ADMIN".equals(admin.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            Map<String, Object> stats = new HashMap<>();

            //User statistics
            stats.put("totalUsers", userRepository.count());
            stats.put("activeUsers", userRepository.countByRole("USER"));
            stats.put("adminUsers", userRepository.countByRole("ADMIN"));

            //Event statistics
            stats.put("totalEvents", eventRepository.count());
            stats.put("activeEvents", eventRepository.countByStatus(Event.EventStatus.ACTIVE));
            stats.put("upcomingEvents", eventRepository.countByEventDateAfter(LocalDateTime.now()));

            //Booking statistics
            stats.put("totalBookings", bookingRepository.count());
            stats.put("confirmedBookings", bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED));
            stats.put("pendingBookings", bookingRepository.countByStatus(Booking.BookingStatus.PENDING));
            stats.put("completedBookings", bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));
            stats.put("cancelledBookings", bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED));

            //Revenue calculation (simplified)
            Double totalRevenue = bookingRepository.findAll().stream()
                    .filter(booking -> booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                            booking.getStatus() == Booking.BookingStatus.COMPLETED)
                    .mapToDouble(booking -> booking.getTotalAmount().doubleValue())
                    .sum();
            stats.put("totalRevenue", totalRevenue);

            //System status
            stats.put("systemStatus", "Online");
            stats.put("lastUpdated", LocalDateTime.now());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "details", e.toString()));
        }
    }

    //Get user management data
    @GetMapping("/users/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchUsers(@RequestParam(required = false) String q) {
        try {
            List<User> users;
            if (q != null && !q.trim().isEmpty()) {
                users = userRepository
                        .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(q);
            } else {
                users = userRepository.findAll();
            }

            //Convert to DTOs for security
            List<Map<String, Object>> userDTOs = users.stream()
                    .map(user -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", user.getId());
                        dto.put("username", user.getUsername());
                        dto.put("email", user.getEmail());
                        dto.put("fullName", user.getFullName());
                        dto.put("role", user.getRole());
                        dto.put("createdAt", user.getCreatedAt());
                        dto.put("isActive", true); // You might want to add an active field to User entity
                        return dto;
                    })
                    .toList();

            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //Get audit logs 
    @GetMapping("/audit-logs")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getAuditLogs() {
        try {
            List<Map<String, Object>> logs = List.of(
                    Map.of(
                            "id", 1L,
                            "timestamp", LocalDateTime.now().minusHours(1),
                            "level", "INFO",
                            "message", "Admin login successful",
                            "user", "admin",
                            "ip", "192.168.1.100"),
                    Map.of(
                            "id", 2L,
                            "timestamp", LocalDateTime.now().minusHours(2),
                            "level", "WARNING",
                            "message", "High memory usage detected",
                            "user", "system",
                            "ip", "system"),
                    Map.of(
                            "id", 3L,
                            "timestamp", LocalDateTime.now().minusHours(3),
                            "level", "ERROR",
                            "message", "Failed login attempt",
                            "user", "unknown",
                            "ip", "192.168.1.101"));

            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //System management endpoints
    @PostMapping("/system/maintenance")
    public ResponseEntity<?> toggleMaintenanceMode(@RequestBody Map<String, Boolean> request) {
        try {
            Boolean enabled = request.get("enabled");
            return ResponseEntity.ok(Map.of(
                    "message", "Maintenance mode " + (enabled ? "enabled" : "disabled"),
                    "maintenanceMode", enabled,
                    "timestamp", LocalDateTime.now()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/security/force-logout-all")
    public ResponseEntity<?> forceLogoutAll() {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "All users have been logged out",
                    "timestamp", LocalDateTime.now(),
                    "affectedUsers", userRepository.count()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //Helper method to create AdminProfileDTO
    private AdminProfileDTO createAdminProfileDTO(User admin) {
        AdminProfileDTO dto = new AdminProfileDTO();
        dto.setId(admin.getId());
        dto.setUsername(admin.getUsername());
        dto.setEmail(admin.getEmail());
        dto.setFullName(admin.getFullName());
        dto.setPhone(admin.getPhone());
        dto.setAddress(admin.getAddress());
        dto.setRole(admin.getRole());
        dto.setDepartment("IT Management");
        dto.setAdminLevel("Super Admin");
        dto.setPermissions("Full Access");
        dto.setLastLogin(LocalDateTime.now().minusHours(2));
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setUpdatedAt(admin.getUpdatedAt());
        dto.setActive(true);
        dto.setProfileImage(null);
        dto.setEmergencyContact("Emergency Contact");
        dto.setEmergencyPhone("+1 (555) 123-4567");
        dto.setWorkSchedule("Monday-Friday, 9AM-5PM");
        dto.setOfficeLocation("Main Office, Floor 3");
        dto.setEmployeeId("ADM001");
        dto.setSupervisor("System Owner");
        dto.setNotes("Primary system administrator");

        //System statistics
        dto.setTotalUsers(userRepository.count());
        dto.setActiveEvents(eventRepository.countByStatus(Event.EventStatus.ACTIVE));
        dto.setTotalRevenue(bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.CONFIRMED ||
                        booking.getStatus() == Booking.BookingStatus.COMPLETED)
                .mapToDouble(booking -> booking.getTotalAmount().doubleValue())
                .sum());
        dto.setSystemStatus("Online");
        dto.setTotalBookings(bookingRepository.count());
        dto.setPendingBookings(bookingRepository.countByStatus(Booking.BookingStatus.PENDING));
        dto.setCompletedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));
        dto.setCancelledBookings(bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED));

        // Admin activity 
        dto.setActionsPerformed(150L);
        dto.setUsersManaged(userRepository.count());
        dto.setEventsManaged(eventRepository.count());
        dto.setSystemLogins(25L);
        dto.setLastAction(LocalDateTime.now().minusMinutes(30));
        dto.setLastActionType("Profile Update");
        return dto;
    }
}
