package org.harsha.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.harsha.backend.config.JwtTokenProvider;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.PasswordResetToken;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.PasswordResetTokenRepository;
import org.harsha.backend.repository.UserRepository;
import org.harsha.backend.request.LoginRequest;
import org.harsha.backend.response.AuthResponse;
import org.harsha.backend.service.CartService;
import org.harsha.backend.service.CustomerUserDetails;
import org.harsha.backend.service.EmailApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

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
    private final JwtTokenProvider jwtProvider;
    private final CustomerUserDetails customerUserDetails;
    private final CartService cartService;
    
    // Injected newly added services for password reset
    private final EmailApiService emailApiService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url}")
    private String frontendUrl;

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

        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new UserException("Email is already associated with another account");
        }

        User newUser = new User();
        newUser.setEmail(user.getEmail());
        newUser.setFirstName(user.getFirstName());
        newUser.setLastName(user.getLastName());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        newUser.setRole(user.getRole());
        newUser.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        cartService.createCart(savedUser);

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

        Authentication authentication = authenticate(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token, true));
    }

    /**
     * Initiates the Forgot Password flow.
     * 1. Looks up the user.
     * 2. Generates a secure UUID token.
     * 3. Sends an email via Resend with the reset link.
     */
    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<AuthResponse> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email);

        if (user != null) {
            // Remove any old existing tokens for this user before generating a new one
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, user);
            passwordResetTokenRepository.save(resetToken);

            // Create the link pointing to your React frontend
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            // Dispatch email
            emailApiService.sendPasswordResetEmail(user.getEmail(), resetLink);
        }

        // We always return success to prevent malicious users from scanning our database for valid emails.
        return ResponseEntity.ok(new AuthResponse("If the email exists, a reset link has been sent.", true));
    }

    /**
     * Validates the reset token and updates the user's password.
     */
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<AuthResponse> resetPassword(@RequestBody Map<String, String> request) throws UserException {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token);

        if (resetToken == null) {
            throw new UserException("Invalid reset token.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new UserException("Reset token has expired. Please request a new one.");
        }

        // Token is valid. Update the password.
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete the token so it cannot be used again
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok(new AuthResponse("Password successfully updated.", true));
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

        UserDetails userDetails = customerUserDetails.loadUserByUsername(email);

        if (userDetails == null) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities()
        );
    }
}