package com.example.ticketbooking.service;

import com.example.ticketbooking.model.Match;
import com.example.ticketbooking.model.Order;
import com.example.ticketbooking.model.User;
import com.example.ticketbooking.repository.OrderRepository;
import com.example.ticketbooking.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * Membuat pesanan baru untuk pengguna berdasarkan matchId dan jumlah tiket.
     *
     * @param user Pengguna yang membuat pesanan
     * @param matchId ID pertandingan
     * @param numberOfTickets Jumlah tiket yang dipesan
     * @return Order yang dibuat, atau null jika gagal
     * @throws IllegalArgumentException jika stok tiket tidak cukup atau data tidak valid
     */
    @Transactional
    public Order createOrder(User user, Long matchId, int numberOfTickets) {
        if (user == null || matchId == null || numberOfTickets <= 0) {
            throw new IllegalArgumentException("Data pesanan tidak valid");
        }

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Pertandingan tidak ditemukan"));

        if (match.getAvailableTickets() < numberOfTickets) {
            throw new IllegalArgumentException("Stok tiket tidak mencukupi");
        }

        Order order = new Order();
        order.setUser(user);
        order.setMatch(match);
        order.setNumberOfTickets(numberOfTickets);
        order.setTotalPrice(numberOfTickets * match.getPricePerTicket());
        order.setStatus((byte) 0); // 0: Pending
        order.setOrderDate(new Timestamp(System.currentTimeMillis()));

        // Kurangi stok tiket yang tersedia
        match.setAvailableTickets(match.getAvailableTickets() - numberOfTickets);
        matchRepository.save(match);

        return orderRepository.save(order);
    }

    /**
     * Mendapatkan daftar pesanan berdasarkan ID pengguna.
     *
     * @param userId ID pengguna
     * @return List of Order untuk pengguna
     */
    public List<Order> getOrdersByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("ID pengguna tidak boleh null");
        }
        return orderRepository.findByUserId(userId);
    }
}