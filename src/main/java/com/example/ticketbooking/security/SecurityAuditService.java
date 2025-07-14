package com.example.ticketbooking.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SecurityAuditService {

    private static final Logger securityLogger = LoggerFactory.getLogger("SECURITY_AUDIT");

    private final Map<String, FailedLoginAttempt> failedLoginAttempts = new ConcurrentHashMap<>();

    public void logLoginAttempt(String username, String ipAddress, boolean success) {
        if (success) {
            securityLogger.info("SUCCESSFUL_LOGIN - Username: {}, IP: {}, Timestamp: {}",
                    username, ipAddress, LocalDateTime.now());

            failedLoginAttempts.remove(ipAddress);
        } else {
            securityLogger.warn("FAILED_LOGIN - Username: {}, IP: {}, Timestamp: {}",
                    username, ipAddress, LocalDateTime.now());

            trackFailedAttempt(ipAddress);
        }
    }

    public void logRegistrationAttempt(String username, String email, String ipAddress, boolean success) {
        if (success) {
            securityLogger.info("SUCCESSFUL_REGISTRATION - Username: {}, Email: {}, IP: {}, Timestamp: {}",
                    username, email, ipAddress, LocalDateTime.now());
        } else {
            securityLogger.warn("FAILED_REGISTRATION - Username: {}, Email: {}, IP: {}, Timestamp: {}",
                    username, email, ipAddress, LocalDateTime.now());
        }
    }

    public void logUnauthorizedAccess(String endpoint, String ipAddress, String reason) {
        securityLogger.warn("UNAUTHORIZED_ACCESS - Endpoint: {}, IP: {}, Reason: {}, Timestamp: {}",
                endpoint, ipAddress, reason, LocalDateTime.now());
    }

    public void logRateLimitExceeded(String ipAddress, String endpoint) {
        securityLogger.warn("RATE_LIMIT_EXCEEDED - IP: {}, Endpoint: {}, Timestamp: {}",
                ipAddress, endpoint, LocalDateTime.now());
    }

    public void logSuspiciousActivity(String activity, String ipAddress, String details) {
        securityLogger.error("SUSPICIOUS_ACTIVITY - Activity: {}, IP: {}, Details: {}, Timestamp: {}",
                activity, ipAddress, details, LocalDateTime.now());
    }

    public boolean isIpBlocked(String ipAddress) {
        FailedLoginAttempt attempt = failedLoginAttempts.get(ipAddress);
        if (attempt != null) {

            return attempt.getFailedAttempts() >= 5 &&
                    attempt.getLastAttemptTime().isAfter(LocalDateTime.now().minusMinutes(15));
        }
        return false;
    }

    private void trackFailedAttempt(String ipAddress) {
        failedLoginAttempts.compute(ipAddress, (key, existing) -> {
            if (existing == null) {
                return new FailedLoginAttempt(LocalDateTime.now(), 1);
            } else {
                existing.incrementAttempts();
                existing.setLastAttemptTime(LocalDateTime.now());
                return existing;
            }
        });
    }

    private static class FailedLoginAttempt {
        private LocalDateTime lastAttemptTime;
        private int failedAttempts;

        public FailedLoginAttempt(LocalDateTime lastAttemptTime, int failedAttempts) {
            this.lastAttemptTime = lastAttemptTime;
            this.failedAttempts = failedAttempts;
        }

        public LocalDateTime getLastAttemptTime() {
            return lastAttemptTime;
        }

        public void setLastAttemptTime(LocalDateTime lastAttemptTime) {
            this.lastAttemptTime = lastAttemptTime;
        }

        public int getFailedAttempts() {
            return failedAttempts;
        }

        public void incrementAttempts() {
            this.failedAttempts++;
        }
    }
}