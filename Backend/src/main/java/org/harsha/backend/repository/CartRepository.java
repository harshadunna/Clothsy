package org.harsha.backend.repository;

import org.harsha.backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * CartRepository
 *
 * Data access layer for the Cart entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides a custom query to retrieve a user's cart
 * directly by their user ID.
 */
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Retrieves the cart belonging to a specific user.
     *
     * Traverses the Cart → User relationship to match by user ID,
     * avoiding the need to load the full User entity first.
     *
     * @param userId the ID of the user whose cart to retrieve
     * @return the matching Cart, or null if no cart exists for this user
     */
    @Query("SELECT c FROM Cart c WHERE c.user.id = :userId")
    Cart findByUserId(@Param("userId") Long userId);
}