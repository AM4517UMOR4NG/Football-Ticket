package com.example.ticketbooking.config;

import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class SecurityFilterChainConfig {
    // Kosongkan kelas ini karena konfigurasi filter tidak lagi diperlukan
    // Enkoding akan ditangani oleh spring.web.encoding di application.properties
}