package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.config.JwtProvider;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * UserServiceImplementation
 *
 * Concrete implementation of {@link UserService}.
 * Handles all user-related business logic including
 * fetching users by ID, resolving users from JWT tokens,
 * and retrieving all users for admin views.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImplementation implements UserService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;

    /**
     * Finds a user by their unique database ID.
     * Throws UserException if no user exists with the given ID.
     */
    @Override
    public User findUserById(Long userId) throws UserException {

        Optional<User> opt = userRepository.findById(userId);

        if (opt.isPresent()) {
            return opt.get();
        }

        throw new UserException("User not found with id: " + userId);
    }

    /**
     * Extracts the email from the JWT token and retrieves
     * the corresponding user from the database.
     * Throws UserException if no user exists with the extracted email.
     */
    @Override
    public User findUserProfileByJwt(String jwt) throws UserException {

        String email = jwtProvider.getEmailFromToken(jwt);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new UserException("User not found with email: " + email);
        }

        return user;
    }

    /**
     * Retrieves all registered users sorted by creation date (newest first).
     */
    @Override
    public List<User> findAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc();
    }
}