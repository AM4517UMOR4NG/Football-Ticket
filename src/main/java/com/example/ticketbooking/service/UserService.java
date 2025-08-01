package com.example.ticketbooking.service;

import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.security.PasswordValidationService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidationService passwordValidationService;

    private static final String DEFAULT_ROLE = "USER";

    public User registerUser(UserRegistrationDTO registrationDTO) {
        validateUserRegistration(registrationDTO);
        validatePassword(registrationDTO.password());

        User user = createUserFromDTO(registrationDTO);
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
        createDefaultAdminIfNotExists();
        createDefaultUserIfNotExists();
    }

    private void validateUserRegistration(UserRegistrationDTO registrationDTO) {
        if (userRepository.findByUsername(registrationDTO.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(registrationDTO.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
    }

    private void validatePassword(String password) {
        PasswordValidationService.PasswordValidationResult passwordValidation = passwordValidationService
                .validatePassword(password);
        if (!passwordValidation.isValid()) {
            throw new IllegalArgumentException("Password validation failed: " + passwordValidation.getErrorMessage());
        }
    }

    private User createUserFromDTO(UserRegistrationDTO registrationDTO) {
        User user = new User();
        user.setUsername(registrationDTO.username());
        user.setEmail(registrationDTO.email());
        user.setPassword(passwordEncoder.encode(registrationDTO.password()));
        user.setFullName(registrationDTO.fullName());
        user.setPhoneNumber(registrationDTO.phoneNumber());

        String role = determineUserRole(registrationDTO.role());
        user.setRole(role);

        return user;
    }

    private String determineUserRole(String requestedRole) {
        return (requestedRole != null && !requestedRole.isEmpty()) ? requestedRole : DEFAULT_ROLE;
    }

    private void createDefaultAdminIfNotExists() {
        if (userRepository.findByUsername("Alogo12").isEmpty()) {
            UserRegistrationDTO adminDto = new UserRegistrationDTO(
                    "Alogo12",
                    "alogo12@example.com",
                    "Alogo.situ24",
                    "Alogo Situmorang",
                    "081234567812",
                    "ADMIN");

            if (isPasswordValid(adminDto.password())) {
                User admin = createUserFromDTO(adminDto);
                userRepository.save(admin);
                log.info("Default admin 'Alogo12' created successfully");
            } else {
                log.error("Failed to create default admin: invalid password");
            }
        }
    }

    private void createDefaultUserIfNotExists() {
        if (userRepository.findByUsername("user1").isEmpty()) {
            UserRegistrationDTO userDto = new UserRegistrationDTO(
                    "user1",
                    "user1@example.com",
                    "User.1234",
                    "Default User",
                    "081234567899",
                    "USER");

            if (isPasswordValid(userDto.password())) {
                User user = createUserFromDTO(userDto);
                userRepository.save(user);
                log.info("Default user 'user1' created successfully");
            } else {
                log.error("Failed to create default user: invalid password");
            }
        }
    }

    private boolean isPasswordValid(String password) {
        PasswordValidationService.PasswordValidationResult validation = passwordValidationService
                .validatePassword(password);
        return validation.isValid();
    }
}