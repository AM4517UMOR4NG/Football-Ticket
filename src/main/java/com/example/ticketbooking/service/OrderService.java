package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.model.Order;
import com.example.ticketbooking.model.OrderStatus;
import com.example.ticketbooking.model.User;
import com.example.ticketbooking.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository repository;

    @Autowired
    private MatchService matchService;

    public Order createOrder(User user, Long matchId, int numberOfTickets) {
        Match match = matchService.getMatchById(matchId);
        if (match == null || match.getAvailableTickets() < numberOfTickets) {
            throw new RuntimeException("Tidak cukup tiket tersedia");
        }
        Order order = new Order();
        order.setUser(user);
        order.setMatch(match);
        order.setNumberOfTickets(numberOfTickets);
        order.setTotalPrice(match.getPricePerTicket() * numberOfTickets);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        match.setAvailableTickets(match.getAvailableTickets() - numberOfTickets);
        matchService.saveMatch(match);
        return repository.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return repository.findByUserId(userId);
    }
}