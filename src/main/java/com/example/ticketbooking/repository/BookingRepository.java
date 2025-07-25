package com.example.ticketbooking.repository;

import com.example.ticketbooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_Id(Long userId);

    List<Booking> findByEvent_Id(Long eventId);

    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByStatus(Booking.BookingStatus status);

    long countByStatus(Booking.BookingStatus status);
}