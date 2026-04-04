package org.harsha.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.harsha.backend.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Configuration
public class AppConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    @Lazy
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private CartService cartService;

    @Autowired
    @Lazy
    private JwtTokenProvider jwtProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/payments/webhook").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                // OAUTH2 LOGIN CONFIGURATION
                .oauth2Login(oauth2 -> oauth2
                        .successHandler((request, response, authentication) -> {
                            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

                            // GitHub uses "login" if email is hidden, Google uses "email"
                            String email = oAuth2User.getAttribute("email");
                            if (email == null) email = oAuth2User.getAttribute("login") + "@github.com";

                            String firstName = oAuth2User.getAttribute("given_name");
                            String lastName = oAuth2User.getAttribute("family_name");
                            if (firstName == null) firstName = oAuth2User.getAttribute("name");
                            if (firstName == null) firstName = "User";
                            if (lastName == null) lastName = "";

                            User user = userRepository.findByEmail(email);
                            if (user == null) {
                                user = new User();
                                user.setEmail(email);
                                user.setFirstName(firstName);
                                user.setLastName(lastName);
                                user.setRole("ROLE_CUSTOMER");
                                user.setProvider("OAUTH2");
                                user.setCreatedAt(LocalDateTime.now());
                                user = userRepository.save(user);
                                cartService.createCart(user);
                            }

                            // Generate our local JWT (Pass the actual role instead of hardcoding)
                            String token = jwtProvider.generateTokenFromEmail(user.getEmail(), user.getRole());

                            // Redirect back to frontend
                            response.sendRedirect("http://localhost:5173/oauth2/redirect?token=" + token);
                        })
                )
                .addFilterBefore(new JwtTokenValidator(jwtSecret), BasicAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(formLogin -> formLogin.disable())
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration cfg = new CorsConfiguration();
            cfg.setAllowedOrigins(Arrays.asList(
                    "http://localhost:5173"
            ));
            cfg.setAllowedMethods(Collections.singletonList("*"));
            cfg.setAllowCredentials(true);
            cfg.setAllowedHeaders(Collections.singletonList("*"));
            cfg.setExposedHeaders(Collections.singletonList("Authorization"));
            cfg.setMaxAge(3600L);
            return cfg;
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}