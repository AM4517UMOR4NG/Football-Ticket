package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationDTO registrationDTO) {
        if (userRepository.findByUsername(registrationDTO.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(registrationDTO.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setUsername(registrationDTO.username());
        user.setEmail(registrationDTO.email());
        user.setPassword(passwordEncoder.encode(registrationDTO.password()));
        user.setFullName(registrationDTO.fullName());
        user.setPhoneNumber(registrationDTO.phoneNumber());
        user.setRole(registrationDTO.role());
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Inisialisasi pengguna default "alogo" dengan password "alogositumorang"
    @PostConstruct
    public void initializeDefaultUser() {
        if (!userRepository.findByUsername("alogo").isPresent()) {
            UserRegistrationDTO registrationDTO = new UserRegistrationDTO(
                "alogo",
                "alogo@example.com",
                "alogositumorang",
                "Alogo Situmorang",
                "1234567890",
                "USER"
            );
            registerUser(registrationDTO);
        }
    }
}