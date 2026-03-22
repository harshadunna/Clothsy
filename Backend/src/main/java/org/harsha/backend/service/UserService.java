package org.harsha.backend.service;

import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;

import java.util.List;

/**
 * UserService Interface
 *
 * Defines the contract for all user-related business operations.
 * Implementations of this interface handle the actual logic
 * for fetching and managing user data.
 */
public interface UserService {

    /**
     * Finds a user by their unique database ID.
     *
     * @param userId the ID of the user to retrieve
     * @return the matching User entity
     * @throws UserException if no user is found with the given ID
     */
    User findUserById(Long userId) throws UserException;

    /**
     * Extracts the authenticated user's profile from a JWT token.
     * Decodes the email from the token and fetches the corresponding user.
     *
     * @param jwt raw Authorization header value (includes "Bearer " prefix)
     * @return the User entity associated with the token
     * @throws UserException if the token is invalid or the user is not found
     */
    User findUserProfileByJwt(String jwt) throws UserException;

    /**
     * Retrieves all registered users in the system.
     * Typically used for admin-level operations.
     *
     * @return list of all User entities
     */
    List<User> findAllUsers();
}
