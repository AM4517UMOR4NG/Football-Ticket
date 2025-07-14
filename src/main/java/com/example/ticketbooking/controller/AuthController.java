package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.LoginRequest;
import com.example.ticketbooking.dto.LoginResponse;
import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.service.UserService;
import com.example.ticketbooking.security.JwtTokenProvider;
import com.example.ticketbooking.security.SecurityAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private SecurityAuditService securityAuditService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationDTO userDto, HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        try {
            userService.registerUser(userDto);
            securityAuditService.logRegistrationAttempt(userDto.username(), userDto.email(), clientIp, true);
            return ResponseEntity.ok(new ApiResponse(true, "User registered successfully"));
        } catch (IllegalArgumentException ex) {
            securityAuditService.logRegistrationAttempt(userDto.username(), userDto.email(), clientIp, false);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, ex.getMessage()));
        } catch (Exception ex) {
            securityAuditService.logRegistrationAttempt(userDto.username(), userDto.email(), clientIp, false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Registration failed: " + ex.getMessage()));
        }
    }

    @GetMapping("/auth/verify")
    public ResponseEntity<?> verifyToken(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            return ResponseEntity.ok(new ApiResponse(true, "Token is valid"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Invalid token"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));

            String jwt = jwtTokenProvider.generateToken(authentication);

            Optional<User> userOptional = userService.findByUsername(loginRequest.getUsername());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, true);
                LoginResponse loginResponse = new LoginResponse(jwt, user.getId(), user.getUsername(), user.getEmail(),
                        user.getFullName());
                return ResponseEntity.ok(loginResponse);
            } else {
                securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "User not found after authentication"));
            }

        } catch (AuthenticationException ex) {
            securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username or password: " + ex.getMessage()));
        } catch (Exception ex) {
            securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Login failed: " + ex.getMessage()));
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    public static class ApiResponse {
        private Boolean success;
        private String message;

        public ApiResponse(Boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public Boolean getSuccess() {
            return success;
        }

        public void setSuccess(Boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void sestMessage(String message) {
            this.message = message;
        }
    }
}