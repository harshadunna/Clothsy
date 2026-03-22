package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializationComponent
 *
 * Runs automatically on application startup via {@link CommandLineRunner}.
 * Responsible for seeding essential default data into the database
 * if it doesn't already exist.
 *
 * Currently seeds a default admin user with a pre-configured
 * email and password so the system has an admin account
 * ready to use immediately after first launch.
 */
@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartService cartService;

    /**
     * Entry point called by Spring Boot after the application context is loaded.
     * Triggers all data initialization routines.
     */
    @Override
    public void run(String... args) {
        initializeAdminUser();
    }

    /**
     * Creates a default admin user if one does not already exist.
     * Also creates an empty cart for the admin user.
     *
     * Credentials:
     * - Email:    admin@harsha.com
     * - Password: admin123 (BCrypt encoded before storage)
     * - Role:     ROLE_ADMIN
     */
    private void initializeAdminUser() {

        String adminEmail = "admin@harsha.com";

        // Skip creation if an admin account already exists
        if (userRepository.findByEmail(adminEmail) != null) {
            return;
        }

        User adminUser = new User();
        adminUser.setEmail(adminEmail);
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setFirstName("Harsha");
        adminUser.setLastName("Admin");
        adminUser.setRole("ROLE_ADMIN");

        User savedAdmin = userRepository.save(adminUser);

        // Initialize an empty cart for the admin user
        cartService.createCart(savedAdmin);
    }
}