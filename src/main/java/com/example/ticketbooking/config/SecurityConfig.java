package com.example.ticketbooking.config;

import com.example.ticketbooking.security.JwtAuthenticationFilter;
import com.example.ticketbooking.security.JwtTokenProvider;
import com.example.ticketbooking.security.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.core.annotation.Order;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain h2ConsoleSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher(new AntPathRequestMatcher("/h2-console/**"))
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
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(new AntPathRequestMatcher("/")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/favicon.ico")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/login.html")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.html")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.css")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.js")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.ico")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.png")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.jpg")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.jpeg")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.gif")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/**/*.svg")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/events/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/leagues/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/about/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/wishlist/**")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/bookings/**")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/profile")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/profile/**")).authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userDetailsService),
                        UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

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