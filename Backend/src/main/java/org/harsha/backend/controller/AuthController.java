package org.harsha.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.harsha.backend.config.JwtProvider;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.harsha.backend.request.LoginRequest;
import org.harsha.backend.response.AuthResponse;
import org.harsha.backend.service.CartService;
import org.harsha.backend.service.CustomUserDetailsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AuthController
 *
 * Handles all authentication-related HTTP endpoints.
 * Provides signup and signin functionality for users.
 *
 * Base URL: /auth
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final CartService cartService;

    /**
     * Registers a new user account.
     *
     * Flow:
     * 1. Check if email is already taken
     * 2. Create and save the new user with encoded password
     * 3. Create an empty cart for the new user
     * 4. Generate and return a JWT token
     *
     * @param user request body containing registration details
     * @return JWT token and success status
     * @throws UserException if the email is already in use
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody User user) throws UserException {

        // Reject registration if email is already associated with an account
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new UserException("Email is already associated with another account");
        }

        // Build and persist the new user with a securely hashed password
        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setRole(user.getRole());

        User savedUser = userRepository.save(newUser);

        // Initialize an empty cart for the newly registered user
        cartService.createCart(savedUser);

        // Authenticate the user and generate a JWT token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), user.getPassword()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token, true));
    }

    /**
     * Authenticates an existing user and returns a JWT token.
     *
     * Flow:
     * 1. Validate credentials against stored user details
     * 2. Store authentication in the SecurityContext
     * 3. Generate and return a JWT token
     *
     * @param loginRequest request body containing email and password
     * @return JWT token and success status
     */
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest loginRequest) {

        // Validate credentials and build the authenticated token
        Authentication authentication = authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token, true));
    }

    /**
     * Internal helper — validates email/password credentials.
     *
     * Loads user details by email, then checks the provided password
     * against the stored BCrypt hash. Throws BadCredentialsException
     * if either check fails, keeping the error message generic for security.
     *
     * @param email    the user's email address
     * @param password the raw password from the login request
     * @return fully authenticated UsernamePasswordAuthenticationToken
     * @throws BadCredentialsException if credentials are invalid
     */
    private Authentication authenticate(String email, String password) {

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        // Reject if no account exists for this email
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reject if the provided password doesn't match the stored hash
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
    }
}