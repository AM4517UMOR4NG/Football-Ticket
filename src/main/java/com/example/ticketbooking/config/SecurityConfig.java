package com.example.ticketbooking.config;

import com.example.ticketbooking.security.JwtAuthenticationFilter;
import com.example.ticketbooking.security.JwtTokenProvider;
import com.example.ticketbooking.security.UserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    @Order(1)
    @ConditionalOnProperty(name = "spring.h2.console.enabled", havingValue = "true")
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(antMatcher("/h2-console/**"))
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider,
            UserDetailsServiceImpl userDetailsService) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(
                                    "{\"error\":\"Unauthorized\",\"message\":\"Authentication required\",\"status\":401}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(
                                    "{\"error\":\"Forbidden\",\"message\":\"Insufficient permissions\",\"status\":403}");
                        }))
                .authorizeHttpRequests(auth -> auth
                        // Static frontend assets & public pages (GET only, no wildcard path-extension match on /api/**)
                        .requestMatchers(antMatcher(HttpMethod.OPTIONS, "/**")).permitAll()
                        .requestMatchers(
                                antMatcher(HttpMethod.GET, "/"),
                                antMatcher(HttpMethod.GET, "/*.html"),
                                antMatcher(HttpMethod.GET, "/favicon.ico"),
                                antMatcher(HttpMethod.GET, "/error"),
                                antMatcher(HttpMethod.GET, "/css/**"),
                                antMatcher(HttpMethod.GET, "/js/**"),
                                antMatcher(HttpMethod.GET, "/images/**"),
                                antMatcher(HttpMethod.GET, "/uploads/**"),
                                antMatcher(HttpMethod.GET, "/faq"),
                                antMatcher(HttpMethod.GET, "/terms"),
                                antMatcher(HttpMethod.GET, "/privacypolicy"),
                                antMatcher(HttpMethod.GET, "/api/privacy-policy/**")).permitAll()
                        // Public authentication endpoints (verify requires valid JWT)
                        .requestMatchers(
                                antMatcher(HttpMethod.POST, "/api/auth/login"),
                                antMatcher(HttpMethod.POST, "/api/auth/register"),
                                antMatcher(HttpMethod.POST, "/api/auth/google"),
                                antMatcher(HttpMethod.GET, "/api/auth/google/client-id")).permitAll()
                        .requestMatchers(antMatcher("/api/auth/verify")).authenticated()
                        // Midtrans webhook (verified via SHA-512 signature_key) & public client key
                        .requestMatchers(
                                antMatcher(HttpMethod.POST, "/api/payments/notification"),
                                antMatcher(HttpMethod.GET, "/api/payments/client-key")).permitAll()
                        .requestMatchers(antMatcher("/api/payments/**")).authenticated()
                        // Public read-only catalog endpoints; mutations strictly ADMIN
                        .requestMatchers(
                                antMatcher(HttpMethod.GET, "/api/events/**"),
                                antMatcher(HttpMethod.GET, "/api/leagues/**"),
                                antMatcher(HttpMethod.GET, "/api/about/**")).permitAll()
                        .requestMatchers(
                                antMatcher(HttpMethod.POST, "/api/events/**"),
                                antMatcher(HttpMethod.PUT, "/api/events/**"),
                                antMatcher(HttpMethod.DELETE, "/api/events/**"),
                                antMatcher(HttpMethod.POST, "/api/leagues/**"),
                                antMatcher(HttpMethod.PUT, "/api/leagues/**"),
                                antMatcher(HttpMethod.DELETE, "/api/leagues/**")).hasRole("ADMIN")
                        // Role-restricted dashboards & operational endpoints
                        .requestMatchers(antMatcher("/api/admin/**")).hasRole("ADMIN")
                        .requestMatchers(antMatcher("/api/cashier/**")).hasAnyRole("CASHIER", "ADMIN")
                        .requestMatchers(antMatcher("/api/public/cashier/**")).hasAnyRole("CASHIER", "ADMIN")
                        .requestMatchers(antMatcher("/api/user/dashboard/**")).hasRole("USER")
                        // Authenticated user endpoints
                        .requestMatchers(
                                antMatcher("/api/bookings/**"),
                                antMatcher("/api/wishlist/**"),
                                antMatcher("/api/profile"),
                                antMatcher("/api/profile/**")).authenticated()
                        // Deny everything else unless authenticated
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                        .contentTypeOptions(Customizer.withDefaults())
                        .referrerPolicy(ref -> ref.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)));

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
