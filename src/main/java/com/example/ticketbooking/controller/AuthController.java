package com.example.ticketbooking.controller;

import com.example.ticketbooking.dto.GoogleAuthRequest;
import com.example.ticketbooking.dto.LoginRequest;
import com.example.ticketbooking.dto.LoginResponse;
import com.example.ticketbooking.dto.UserRegistrationDTO;
import com.example.ticketbooking.entity.User;
import com.example.ticketbooking.repository.UserRepository;
import com.example.ticketbooking.service.UserService;
import com.example.ticketbooking.security.JwtTokenProvider;
import com.example.ticketbooking.security.SecurityAuditService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private SecurityAuditService securityAuditService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.security.trust-proxy-headers:false}")
    private boolean trustProxyHeaders;

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

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
                String username = userDetails.getUsername();
                User user = userService.findByUsername(username).orElse(null);
                if (user != null) {
                    java.util.Map<String, Object> safeUser = new java.util.HashMap<>();
                    safeUser.put("id", user.getId());
                    safeUser.put("username", user.getUsername());
                    safeUser.put("email", user.getEmail());
                    safeUser.put("fullName", user.getFullName());
                    safeUser.put("role", user.getRole());
                    safeUser.put("phone", user.getPhone());
                    safeUser.put("address", user.getAddress());
                    return ResponseEntity.ok(safeUser);
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "User not found"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Invalid token"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        if (securityAuditService.isIpBlocked(clientIp)) {
            securityAuditService.logUnauthorizedAccess("/api/auth/login", clientIp, "IP temporarily blocked due to failed attempts");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse(false, "Too many failed login attempts. Please try again later."));
        }

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
                        user.getFullName(), user.getRole());
                return ResponseEntity.ok(loginResponse);
            } else {
                securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid username or password"));
            }

        } catch (AuthenticationException ex) {
            securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username or password"));
        } catch (Exception ex) {
            securityAuditService.logLoginAttempt(loginRequest.getUsername(), clientIp, false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Login failed. Please try again later."));
        }
    }

    @GetMapping("/google/client-id")
    public ResponseEntity<?> getGoogleClientId() {
        return ResponseEntity.ok(Collections.singletonMap("clientId", googleClientId));
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateWithGoogle(@RequestBody GoogleAuthRequest googleRequest,
            HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        if (googleClientId == null || googleClientId.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ApiResponse(false, "Google OAuth is not configured on this server"));
        }

        try {
            // Verify the Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleRequest.credential());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Invalid Google token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Google account email is not verified"));
            }
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String fullName = (String) payload.get("name");

            // Find or create user
            User user = findOrCreateGoogleUser(googleId, email, fullName);

            // Generate JWT token
            String jwt = jwtTokenProvider.generateTokenFromUsername(user.getUsername());

            securityAuditService.logLoginAttempt(user.getUsername(), clientIp, true);

            LoginResponse loginResponse = new LoginResponse(
                    jwt, user.getId(), user.getUsername(), user.getEmail(),
                    user.getFullName(), user.getRole());
            return ResponseEntity.ok(loginResponse);

        } catch (Exception ex) {
            securityAuditService.logLoginAttempt("google-auth", clientIp, false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Google authentication failed: " + ex.getMessage()));
        }
    }

    private User findOrCreateGoogleUser(String googleId, String email, String fullName) {
        // 1. Try to find by Google ID
        Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
        if (byGoogleId.isPresent()) {
            return byGoogleId.get();
        }

        // 2. Try to find by email (existing account, link Google)
        Optional<User> byEmail = userRepository.findByEmail(email);
        if (byEmail.isPresent()) {
            User existingUser = byEmail.get();
            existingUser.setGoogleId(googleId);
            return userRepository.save(existingUser);
        }

        // 3. Create new user
        User newUser = new User();
        newUser.setGoogleId(googleId);
        newUser.setEmail(email);
        newUser.setFullName(fullName != null ? fullName : email.split("@")[0]);
        newUser.setUsername(email.split("@")[0] + "_g" + googleId.substring(0, Math.min(4, googleId.length())));
        newUser.setPassword(null); // No password for Google-only users
        newUser.setRole("USER");
        return userRepository.save(newUser);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        if (trustProxyHeaders) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
                return xForwardedFor.split(",")[0].trim();
            }

            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
                return xRealIp;
            }
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

        public void setMessage(String message) {
            this.message = message;
        }
    }
}