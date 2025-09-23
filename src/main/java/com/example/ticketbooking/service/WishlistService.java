package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.WishlistDTO;
import com.example.ticketbooking.dto.WishlistRequestDTO;
import com.example.ticketbooking.entity.Wishlist;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.repository.WishlistRepository;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {
    
    private static final Logger logger = LoggerFactory.getLogger(WishlistService.class);
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    
    public WishlistDTO addToWishlist(Long userId, WishlistRequestDTO request) {
        logger.info("Adding event {} to wishlist for user {}", request.eventId(), userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + request.eventId()));
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserAndEvent(user, event)) {
            throw new IllegalArgumentException("Event is already in your wishlist");
        }
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setEvent(event);
        wishlist.setNotifyOnPriceDrop(request.notifyOnPriceDrop() != null ? request.notifyOnPriceDrop() : false);
        wishlist.setNotifyBeforeEvent(request.notifyBeforeEvent() != null ? request.notifyBeforeEvent() : true);
        
        Wishlist savedWishlist = wishlistRepository.save(wishlist);
        logger.info("Successfully added event {} to wishlist for user {}", request.eventId(), userId);
        
        return WishlistDTO.fromEntity(savedWishlist);
    }
    
    public void removeFromWishlist(Long userId, Long eventId) {
        logger.info("Removing event {} from wishlist for user {}", eventId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with id: " + eventId));
        
        if (!wishlistRepository.existsByUserAndEvent(user, event)) {
            throw new IllegalArgumentException("Event is not in your wishlist");
        }
        
        wishlistRepository.deleteByUserAndEvent(user, event);
        logger.info("Successfully removed event {} from wishlist for user {}", eventId, userId);
    }
    
    @Transactional(readOnly = true)
    public List<WishlistDTO> getUserWishlist(Long userId) {
        logger.info("Fetching wishlist for user {}", userId);
        
        List<Wishlist> wishlists = wishlistRepository.findByUserIdOrderByAddedDateDesc(userId);
        return wishlists.stream()
                .map(WishlistDTO::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public boolean isEventInWishlist(Long userId, Long eventId) {
        return wishlistRepository.existsByUserIdAndEventId(userId, eventId);
    }
    
    public WishlistDTO updateWishlistSettings(Long userId, Long eventId, WishlistRequestDTO request) {
        logger.info("Updating wishlist settings for user {} and event {}", userId, eventId);
        
        Wishlist wishlist = wishlistRepository.findByUserIdAndEventId(userId, eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event is not in your wishlist"));
        
        if (request.notifyOnPriceDrop() != null) {
            wishlist.setNotifyOnPriceDrop(request.notifyOnPriceDrop());
        }
        
        if (request.notifyBeforeEvent() != null) {
            wishlist.setNotifyBeforeEvent(request.notifyBeforeEvent());
        }
        
        Wishlist updatedWishlist = wishlistRepository.save(wishlist);
        logger.info("Successfully updated wishlist settings for user {} and event {}", userId, eventId);
        
        return WishlistDTO.fromEntity(updatedWishlist);
    }
    
    @Transactional(readOnly = true)
    public Long getWishlistCount(Long userId) {
        return (long) wishlistRepository.findByUserIdOrderByAddedDateDesc(userId).size();
    }
    
    @Transactional(readOnly = true)
    public Long getEventWishlistCount(Long eventId) {
        return wishlistRepository.countByEventId(eventId);
    }
}
