package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.Wishlist;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    List<Wishlist> findByUserOrderByAddedDateDesc(User user);
    
    List<Wishlist> findByUserIdOrderByAddedDateDesc(Long userId);
    
    Optional<Wishlist> findByUserAndEvent(User user, Event event);
    
    boolean existsByUserAndEvent(User user, Event event);
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    void deleteByUserAndEvent(User user, Event event);
    
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.event.id = :eventId")
    Optional<Wishlist> findByUserIdAndEventId(@Param("userId") Long userId, @Param("eventId") Long eventId);
    
    @Query("SELECT COUNT(w) FROM Wishlist w WHERE w.event.id = :eventId")
    Long countByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.notifyOnPriceDrop = true")
    List<Wishlist> findWishlistsWithPriceDropNotification(@Param("userId") Long userId);
    
    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId AND w.notifyBeforeEvent = true")
    List<Wishlist> findWishlistsWithEventNotification(@Param("userId") Long userId);
}
