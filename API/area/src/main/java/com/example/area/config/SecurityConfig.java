package com.example.area.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

        private final SecretKey secretKey;
        private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

        public SecurityConfig(SecretKey secretKey, CustomOAuth2SuccessHandler customOAuth2SuccessHandler) {
                this.secretKey = secretKey;
                this.customOAuth2SuccessHandler = customOAuth2SuccessHandler;
        }

        @Value("${app.frontend.url:http://localhost:8081}")
        private String frontendUrl;

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                // Explicit allowed origins for frontend
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:8081",
                                "http://localhost:5173",
                                "http://localhost:3000",
                                "https://area-250.up.railway.app",
                                "https://adventurous-analysis-production.up.railway.app",
                                frontendUrl));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public AuthenticationEntryPoint customAuthenticationEntryPoint() {
                return (request, response, authException) -> {
                        String path = request.getRequestURI();
                        // For API requests, return 401 JSON response
                        if (path.startsWith("/api/") || path.startsWith("/areas")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.setContentType("application/json");
                                response.getWriter().write(
                                                "{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
                        } else {
                                // For non-API requests (browser), redirect to OAuth login
                                response.sendRedirect("/oauth2/authorization/google");
                        }
                };
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                AuthenticationEntryPoint entryPoint = customAuthenticationEntryPoint();

                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers(
                                                                "/auth/**",
                                                                "/api/auth/**",
                                                                "/api/test/**",
                                                                "/api/webhooks/**",
                                                                "/h2-console/**",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/about.json",
                                                                "/services",
                                                                "/services/**",
                                                                "/oauth2/**",
                                                                "/login/oauth2/**",
                                                                "/client.apk",
                                                                "/client.apk/**")
                                                .permitAll()
                                                // Protected endpoints
                                                .requestMatchers(
                                                                "/api/user/services/**",
                                                                "/areas/**",
                                                                "/api/timer/**")
                                                .authenticated()
                                                .anyRequest().authenticated())
                                // Exception handling - return 401 for API requests instead of redirecting
                                .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint))
                                // OAuth2 login for browser-based flows only
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(customOAuth2SuccessHandler)
                                                .authorizationEndpoint(auth -> auth.baseUri("/oauth2/authorization")))
                                .addFilterBefore(
                                                new com.example.area.config.JwtAuthenticationFilter(secretKey),
                                                UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers.frameOptions().disable());

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
