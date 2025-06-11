package com.example.ticketbooking.controller;

import com.example.ticketbooking.model.User;
import com.example.ticketbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegisterController {

    @Autowired
    private UserService userService;

    @GetMapping("/register")
    public String showRegistrationForm() {
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String username, @RequestParam String password,
                              @RequestParam String email, @RequestParam String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // Akan di-encode oleh UserService
        user.setEmail(email);
        user.setRole(role);
        userService.registerUser(user);
        return "redirect:/login?success";
    }
}