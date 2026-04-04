package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * CustomUserDetails
 *
 * Custom implementation of Spring Security's {@link UserDetailsService}.
 * Called automatically by Spring Security during the authentication process
 * to load a user's credentials and authorities from the database.
 */
@Service
@RequiredArgsConstructor
public class CustomerUserDetails implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("No account found with email: " + username);
        }

        // 1. Create a list to hold the user's roles/authorities
        List<GrantedAuthority> authorities = new ArrayList<>();

        // 2. Get the role from the MySQL database
        String role = user.getRole();

        // 3. Failsafe: Default to a standard customer role if it's empty in the DB
        if (role == null || role.trim().isEmpty()) {
            role = "ROLE_CUSTOMER"; // Or simply "CUSTOMER" depending on your convention
        }

        // 4. Add the role to Spring Security's authority list
        authorities.add(new SimpleGrantedAuthority(role));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities // 5. Pass the list here instead of an empty ArrayList!
        );
    }
}