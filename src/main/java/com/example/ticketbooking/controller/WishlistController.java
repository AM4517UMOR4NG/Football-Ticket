package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.WishlistDTO;
import com.example.ticketbooking.dto.WishlistRequestDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.service.WishlistService;
import com.example.ticketbooking.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {
    
    private static final Logger logger = LoggerFactory.getLogger(WishlistController.class);
    
    private final WishlistService wishlistService;
    private final UserService userService;
    
    public WishlistController(WishlistService wishlistService, UserService userService) {
        this.wishlistService = wishlistService;
        this.userService = userService;
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@Valid @RequestBody WishlistRequestDTO request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            WishlistDTO wishlistItem = wishlistService.addToWishlist(user.getId(), request);
            return ResponseEntity.ok(wishlistItem);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request to add to wishlist: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error adding to wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to add to wishlist"));
        }
    }
    
    @DeleteMapping("/remove/{eventId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long eventId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            wishlistService.removeFromWishlist(user.getId(), eventId);
            return ResponseEntity.ok(Map.of("message", "Event removed from wishlist successfully"));
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request to remove from wishlist: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error removing from wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to remove from wishlist"));
        }
    }
    
    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<WishlistDTO> wishlist = wishlistService.getUserWishlist(user.getId());
            return ResponseEntity.ok(wishlist);
            
        } catch (Exception e) {
            logger.error("Error fetching wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch wishlist"));
        }
    }
    
    @GetMapping("/check/{eventId}")
    public ResponseEntity<?> checkEventInWishlist(@PathVariable Long eventId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            boolean isInWishlist = wishlistService.isEventInWishlist(user.getId(), eventId);
            return ResponseEntity.ok(Map.of("isInWishlist", isInWishlist));
            
        } catch (Exception e) {
            logger.error("Error checking wishlist status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to check wishlist status"));
        }
    }
    
    @PutMapping("/update/{eventId}")
    public ResponseEntity<?> updateWishlistSettings(@PathVariable Long eventId, 
                                                   @Valid @RequestBody WishlistRequestDTO request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            WishlistDTO updatedWishlist = wishlistService.updateWishlistSettings(user.getId(), eventId, request);
            return ResponseEntity.ok(updatedWishlist);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request to update wishlist: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating wishlist: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update wishlist"));
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getWishlistCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            String username = auth.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Long count = wishlistService.getWishlistCount(user.getId());
            return ResponseEntity.ok(Map.of("count", count));
            
        } catch (Exception e) {
            logger.error("Error fetching wishlist count: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch wishlist count"));
        }
    }
    
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<?> getEventWishlistCount(@PathVariable Long eventId) {
        try {
            Long count = wishlistService.getEventWishlistCount(eventId);
            return ResponseEntity.ok(Map.of("count", count));
            
        } catch (Exception e) {
            logger.error("Error fetching event wishlist count: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to fetch event wishlist count"));
        }
    }
}
