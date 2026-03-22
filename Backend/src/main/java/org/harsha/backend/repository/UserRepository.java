package org.harsha.backend.repository;

import org.harsha.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * UserRepository
 *
 * Data access layer for the User entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * (save, findById, findAll, delete, etc.) out of the box.
 *
 * Spring Data JPA automatically generates the implementation
 * at runtime — no need to write any SQL or JPQL manually.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their email address.
     * Used during login and JWT token resolution.
     *
     * @param email the email address to search for
     * @return the matching User, or null if not found
     */
    User findByEmail(String email);

    /**
     * Retrieves all users sorted by account creation date (newest first).
     * Useful for admin dashboards and user management views.
     *
     * @return list of all users ordered by createdAt descending
     */
    List<User> findAllByOrderByCreatedAtDesc();
}