package com.example.ticketbooking.dto;

import com.example.ticketbooking.entity.Event;
import com.example.ticketbooking.entity.User;
import java.time.LocalDateTime;

public record WishlistDTO(
    Long id,
    Long userId,
    String username,
    Long eventId,
    String eventTitle,
    String eventVenue,
    LocalDateTime eventDate,
    String eventImageUrl,
    LocalDateTime addedDate,
    Boolean notifyOnPriceDrop,
    Boolean notifyBeforeEvent
) {
    public static WishlistDTO fromEntity(com.example.ticketbooking.entity.Wishlist wishlist) {
        Event event = wishlist.getEvent();
        User user = wishlist.getUser();
        
        return new WishlistDTO(
            wishlist.getId(),
            user.getId(),
            user.getUsername(),
            event.getId(),
            event.getTitle(),
            event.getVenue(),
            event.getEventDate(),
            event.getImageUrl(),
            wishlist.getAddedDate(),
            wishlist.getNotifyOnPriceDrop(),
            wishlist.getNotifyBeforeEvent()
        );
    }
}
