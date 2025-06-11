package com.example.ticketbooking.controller;

import com.example.ticketbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public String showProfile(Model model) {
        // Asumsi pengguna sudah login, ambil dari session atau context
        model.addAttribute("user", userService.findByUsername("admin")); // Ganti dengan logika autentikasi
        return "profile";
    }
}