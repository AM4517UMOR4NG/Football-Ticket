package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.Order;
import com.example.ticketbooking.model.User;
import com.example.ticketbooking.service.OrderService;
import com.example.ticketbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller untuk mengelola operasi terkait pesanan (orders).
 *
 * @author aekmo
 */
@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    /**
     * Membuat pesanan baru berdasarkan matchId dan jumlah tiket.
     *
     * @param matchId ID pertandingan
     * @param numberOfTickets Jumlah tiket yang dipesan
     * @param authentication Objek autentikasi untuk mendapatkan username
     * @return Order yang dibuat
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestParam Long matchId,
            @RequestParam int numberOfTickets,
            Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username); // Gunakan findByUsername yang ada
        if (user == null) {
            return ResponseEntity.badRequest().build(); // Kembalikan error jika user tidak ditemukan
        }
        try {
            Order order = orderService.createOrder(user, matchId, numberOfTickets);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); // Tangani error (misalnya stok tiket tidak cukup)
        }
    }

    /**
     * Mendapatkan daftar pesanan untuk pengguna yang sedang login.
     *
     * @param authentication Objek autentikasi untuk mendapatkan username
     * @return List of Order untuk pengguna
     */
    @GetMapping
    public ResponseEntity<List<Order>> getOrders(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().build(); // Kembalikan error jika user tidak ditemukan
        }
        List<Order> orders = orderService.getOrdersByUserId(user.getId());
        return ResponseEntity.ok(orders);
    }
}