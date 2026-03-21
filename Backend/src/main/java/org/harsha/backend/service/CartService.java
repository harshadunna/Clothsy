package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.User;
import org.harsha.backend.request.AddItemRequest;

/**
 * CartService Interface
 *
 * Defines the contract for all shopping cart business operations.
 * Implementations handle cart creation, item management,
 * and cart total calculations.
 */
public interface CartService {

    /**
     * Creates and persists a new empty cart for the given user.
     * Called automatically during user registration.
     *
     * @param user the user to create the cart for
     * @return the newly created Cart entity
     */
    Cart createCart(User user);

    /**
     * Adds a product to the user's cart.
     * If the item already exists (same product + size), returns the existing item.
     * Otherwise creates a new CartItem and adds it to the cart.
     *
     * @param userId the ID of the user adding the item
     * @param req    request containing product ID, size, quantity, and price
     * @return the newly created or existing CartItem
     * @throws ProductException if the product is not found
     */
    CartItem addCartItem(Long userId, AddItemRequest req) throws ProductException;

    /**
     * Retrieves the cart for a specific user and recalculates all totals.
     * Updates total price, discounted price, discount amount, and item count.
     *
     * @param userId the ID of the user whose cart to retrieve
     * @return the updated Cart entity with recalculated totals
     */
    Cart findUserCart(Long userId);
}