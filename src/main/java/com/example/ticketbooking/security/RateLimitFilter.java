package com.example.ticketbooking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    private final Map<String, RequestCount> requestCounts = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final int MAX_REQUESTS_PER_HOUR = 100;

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIpAddress(request);
        String requestPath = request.getRequestURI();

        if (isAuthenticationEndpoint(requestPath)) {
            if (isRateLimitExceeded(clientIp)) {
                logger.warn("Rate limit exceeded for IP: {}", clientIp);
                response.setContentType("application/json");
                response.setStatus(429);
                response.getWriter().write(
                        "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthenticationEndpoint(String path) {
        return path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    }

    private boolean isRateLimitExceeded(String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        RequestCount count = requestCounts.computeIfAbsent(clientIp, k -> new RequestCount());

        count.cleanOldEntries(now);

        if (count.getMinuteCount() >= MAX_REQUESTS_PER_MINUTE ||
                count.getHourCount() >= MAX_REQUESTS_PER_HOUR) {
            return true;
        }

        count.addRequest(now);
        return false;
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

    private static class RequestCount {
        private final Map<LocalDateTime, Integer> minuteRequests = new ConcurrentHashMap<>();
        private final Map<LocalDateTime, Integer> hourRequests = new ConcurrentHashMap<>();

        public void addRequest(LocalDateTime now) {
            LocalDateTime minuteKey = now.withSecond(0).withNano(0);
            LocalDateTime hourKey = now.withMinute(0).withSecond(0).withNano(0);

            minuteRequests.merge(minuteKey, 1, Integer::sum);
            hourRequests.merge(hourKey, 1, Integer::sum);
        }

        public void cleanOldEntries(LocalDateTime now) {
            LocalDateTime oneMinuteAgo = now.minusMinutes(1);
            LocalDateTime oneHourAgo = now.minusHours(1);

            minuteRequests.entrySet().removeIf(entry -> entry.getKey().isBefore(oneMinuteAgo));
            hourRequests.entrySet().removeIf(entry -> entry.getKey().isBefore(oneHourAgo));
        }

        public int getMinuteCount() {
            return minuteRequests.values().stream().mapToInt(Integer::intValue).sum();
        }

        public int getHourCount() {
            return hourRequests.values().stream().mapToInt(Integer::intValue).sum();
        }
    }
}