package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.security.PasswordValidationService;
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
    private final PasswordValidationService passwordValidationService;
    
    public User registerUser(UserRegistrationDTO registrationDTO) {
        if (userRepository.findByUsername(registrationDTO.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(registrationDTO.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        
        PasswordValidationService.PasswordValidationResult passwordValidation = 
            passwordValidationService.validatePassword(registrationDTO.password());
        if (!passwordValidation.isValid()) {
            throw new IllegalArgumentException("Password validation failed: " + passwordValidation.getErrorMessage());
        }
        
        User user = new User();
        user.setUsername(registrationDTO.username());
        user.setEmail(registrationDTO.email());
        user.setPassword(passwordEncoder.encode(registrationDTO.password()));
        user.setFullName(registrationDTO.fullName());
        user.setPhoneNumber(registrationDTO.phoneNumber());
        
        String role = registrationDTO.role() != null && !registrationDTO.role().isEmpty() 
            ? registrationDTO.role() : "USER";
        user.setRole(role);
        
        return userRepository.save(user);
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    @PostConstruct
    public void initDefaultAdmin() {
        if (userRepository.findByUsername("Alogo12").isEmpty()) {
            UserRegistrationDTO adminDto = new UserRegistrationDTO(
            //inject admin
            );
            PasswordValidationService.PasswordValidationResult validation = 
                passwordValidationService.validatePassword(adminDto.password());
            if (validation.isValid()) {
                User admin = new User();
                admin.setUsername(adminDto.username());
                admin.setEmail(adminDto.email());
                admin.setPassword(passwordEncoder.encode(adminDto.password()));
                admin.setFullName(adminDto.fullName());
                admin.setPhoneNumber(adminDto.phoneNumber());
                admin.setRole(adminDto.role());
                userRepository.save(admin);
                System.out.println("Default admin 'Your-admin-name' created successfully");
            }
        }
    }
}
