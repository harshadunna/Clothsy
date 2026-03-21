package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

/**
 * CustomUserDetails
 *
 * Custom implementation of Spring Security's {@link UserDetailsService}.
 * Called automatically by Spring Security during the authentication process
 * to load a user's credentials and authorities from the database.
 *
 * The loaded UserDetails object is then used to verify the provided
 * password and populate the SecurityContext on successful login.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Loads a user's details by their email address.
     *
     * Called internally by Spring Security during login.
     * The "username" parameter is the email address in our system.
     *
     * Flow:
     * 1. Query the database for a user matching the given email
     * 2. Throw UsernameNotFoundException if no match is found
     * 3. Return a UserDetails object with email, hashed password, and authorities
     *
     * @param username the email address provided during login
     * @return UserDetails containing credentials and granted authorities
     * @throws UsernameNotFoundException if no user exists with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("No account found with email: " + username);
        }

        // Empty authorities list — roles can be added here in the future
        // e.g. authorities.add(new SimpleGrantedAuthority("ROLE_USER"))
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );
    }
}