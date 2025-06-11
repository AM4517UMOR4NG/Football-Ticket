package com.example.ticketbooking.repository;

import com.example.ticketbooking.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}