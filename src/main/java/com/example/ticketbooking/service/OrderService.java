package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.model.Order;
import com.example.ticketbooking.model.OrderStatus;
import com.example.ticketbooking.repository.MatchRepository;
import com.example.ticketbooking.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MatchRepository matchRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, MatchRepository matchRepository) {
        this.orderRepository = orderRepository;
        this.matchRepository = matchRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public void createOrder(Long matchId, int numberOfTickets) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
        if (match.getAvailableTickets() < numberOfTickets) {
            throw new IllegalStateException("Not enough tickets available");
        }
        double totalPrice = numberOfTickets * match.getPricePerTicket();
        Order order = new Order();
        order.setNumberOfTickets(numberOfTickets);
        order.setOrderDate(new Timestamp(System.currentTimeMillis()));
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(totalPrice);
        order.setMatch(match);
        // TODO: Set the user properly based on your authentication system
        orderRepository.save(order);
        match.setAvailableTickets(match.getAvailableTickets() - numberOfTickets);
        matchRepository.save(match);
    }
}