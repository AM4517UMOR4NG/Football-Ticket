package com.example.ticketbooking.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    // Endpoint yang tidak memerlukan authentication
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
            "/api/auth/login",
            "/api/auth/register",
            "/api/events/upcoming",
            "/api/events/all",
            "/api/leagues",
            "/api/leagues/active",
            "/api/about/stats",
            "/api/about/team",
            "/api/about/values",
            "/error",
            "/favicon.ico");

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserDetailsServiceImpl userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @org.springframework.lang.NonNull HttpServletRequest request,
            @org.springframework.lang.NonNull HttpServletResponse response,
            @org.springframework.lang.NonNull FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        logger.debug("Processing request: {} {}", method, requestPath);

        try {
            if (isPublicEndpoint(requestPath, method)) {
                logger.debug("Public endpoint accessed: {}", requestPath);
                filterChain.doFilter(request, response);
                return;
            }

            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                if (tokenProvider.validateToken(jwt)) {
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    logger.debug("JWT token valid for user: {}", username);

                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        logger.debug("Authentication set for user: {}", username);

                    } catch (UsernameNotFoundException ex) {
                        logger.error("User not found: {}", username);
                        handleAuthenticationError(response, "User not found");
                        return;
                    }
                } else {
                    logger.warn("Invalid JWT token for request: {}", requestPath);
                    handleAuthenticationError(response, "Invalid or expired token");
                    return;
                }
            } else {
                logger.warn("No JWT token found for protected endpoint: {}", requestPath);
                handleAuthenticationError(response, "Authentication required");
                return;
            }

        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for request: {}", requestPath, ex);
            handleAuthenticationError(response, "Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    private boolean isPublicEndpoint(String path, String method) {
        if (PUBLIC_ENDPOINTS.contains(path)) {
            return true;
        }

        // Check pattern matches
        if (path.startsWith("/api/events") && "GET".equals(method)) {
            return true;
        }

        if (path.startsWith("/api/leagues") && "GET".equals(method)) {
            return true;
        }

        if (path.startsWith("/api/about") && "GET".equals(method)) {
            return true;
        }

        if ("OPTIONS".equals(method)) {
            return true;
        }

        if (path.matches(".*\\.(css|js|png|jpg|jpeg|gif|ico|svg)$")) {
            return true;
        }

        return false;
    }

    private void handleAuthenticationError(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String jsonResponse = String.format(
                "{\"error\": \"Unauthorized\", \"message\": \"%s\", \"status\": 401}",
                message);

        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }

    @Override
    protected boolean shouldNotFilter(@org.springframework.lang.NonNull HttpServletRequest request)
            throws ServletException {
        String path = request.getRequestURI();

        if (path.matches(".*\\.(css|js|png|jpg|jpeg|gif|ico|svg|html)$")) {
            return true;
        }

        if (path.equals("/health") || path.equals("/actuator/health")) {
            return true;
        }

        return false;
    }
}