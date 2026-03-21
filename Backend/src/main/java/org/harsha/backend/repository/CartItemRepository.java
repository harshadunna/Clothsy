package org.harsha.backend.repository;

import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * CartItemRepository
 *
 * Data access layer for the CartItem entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides a custom query to check for existing cart items
 * before adding duplicates to the cart.
 */
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Checks whether a cart item already exists for the given
     * cart, product, size, and user combination.
     *
     * Used before adding a new item to avoid duplicate entries —
     * if the item already exists, quantity should be updated instead.
     *
     * @param cart    the cart to search in
     * @param product the product to check for
     * @param size    the selected size of the product
     * @param userId  the ID of the user who owns the cart
     * @return the existing CartItem if found, or null if not present
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart = :cart " +
            "AND ci.product = :product " +
            "AND ci.size = :size " +
            "AND ci.userId = :userId")
    CartItem isCartItemExist(
            @Param("cart") Cart cart,
            @Param("product") Product product,
            @Param("size") String size,
            @Param("userId") Long userId
    );
}