package com.example.ticketbooking.controller;

import com.example.ticketbooking.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public String showOrders(Model model) {
        model.addAttribute("orders", orderService.getAllOrders());
        return "orders";
    }

    @PostMapping("/orders")
    public String createOrder(@RequestParam Long matchId, @RequestParam int numberOfTickets, Model model) {
        try {
            orderService.createOrder(matchId, numberOfTickets);
            return "redirect:/orders";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "orders";
        }
    }
}