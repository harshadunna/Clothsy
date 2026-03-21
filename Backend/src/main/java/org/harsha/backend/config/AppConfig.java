package org.harsha.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;

/**
 * Central Security Configuration
 *
 * Defines the application's security filter chain including:
 * - Stateless session management (JWT-based, no server-side sessions)
 * - Route-level authorization rules
 * - JWT token validation filter
 * - CSRF protection (disabled for REST APIs)
 * - CORS policy for the React frontend
 * - Password encoding strategy
 */
@Configuration
public class AppConfig {

    /**
     * Configures the main Security Filter Chain.
     *
     * Every incoming HTTP request passes through this chain.
     * The order of configuration matters — filters and rules are applied top to bottom.
     *
     * @param http Spring Security's HttpSecurity builder
     * @return the fully configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Use stateless sessions — no HttpSession is created or used.
                // Each request must carry its own JWT for authentication.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Define which endpoints require authentication and which are public.
                // All /api/** routes require a valid JWT; everything else is open.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )

                // Register our custom JWT filter to run before Spring's built-in
                // BasicAuthenticationFilter, so JWT auth takes precedence.
                .addFilterBefore(new JwtValidator(), BasicAuthenticationFilter.class)

                // Disable CSRF protection — not needed for stateless REST APIs
                // since there are no browser-managed sessions to exploit.
                .csrf(csrf -> csrf.disable())

                // Apply CORS policy to allow the React frontend to communicate
                // with this backend across different origins/ports.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable form-based login — authentication is handled via JWT only.
                .formLogin(formLogin -> formLogin.disable())

                // Disable HTTP Basic auth — not applicable for a JWT-based REST API.
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

    /**
     * CORS Configuration Source
     *
     * Defines which origins, methods, and headers are permitted for cross-origin requests.
     * This allows the React dev server (Vite on port 5173) to make API calls to this backend.
     *
     * @return CorsConfigurationSource with allowed origins and headers
     */
    private CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration cfg = new CorsConfiguration();

            // Allow requests only from the React frontend (Vite dev server)
            cfg.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));

            // Allow all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
            cfg.setAllowedMethods(Collections.singletonList("*"));

            // Allow credentials (cookies, Authorization headers) in cross-origin requests
            cfg.setAllowCredentials(true);

            // Allow all request headers
            cfg.setAllowedHeaders(Collections.singletonList("*"));

            // Expose the Authorization header so the frontend can read the JWT from responses
            cfg.setExposedHeaders(Collections.singletonList("Authorization"));

            // Cache preflight response for 1 hour to reduce OPTIONS request overhead
            cfg.setMaxAge(3600L);

            return cfg;
        };
    }

    /**
     * Password Encoder Bean
     *
     * Uses BCrypt hashing algorithm to securely encode passwords before storing them.
     * BCrypt automatically handles salting and is resistant to brute-force attacks.
     *
     * @return BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}