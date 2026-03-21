package org.harsha.backend.service;

import org.harsha.backend.exception.CartItemException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.Product;

/**
 * CartItemService Interface
 *
 * Defines the contract for all cart item related business operations.
 * Implementations handle the actual logic for managing individual
 * items within a user's shopping cart.
 */
public interface CartItemService {

    /**
     * Creates and persists a new cart item.
     *
     * @param cartItem the CartItem to create
     * @return the saved CartItem entity
     */
    CartItem createCartItem(CartItem cartItem);

    /**
     * Updates an existing cart item's details (e.g. quantity or size).
     * Validates that the requesting user owns the cart item.
     *
     * @param userId   ID of the user requesting the update
     * @param id       ID of the cart item to update
     * @param cartItem updated cart item data
     * @return the updated CartItem entity
     * @throws CartItemException if the cart item is not found
     * @throws UserException     if the user is not authorized to update this item
     */
    CartItem updateCartItem(Long userId, Long id, CartItem cartItem)
            throws CartItemException, UserException;

    /**
     * Checks whether a cart item already exists for the given
     * cart, product, size, and user combination.
     *
     * @param cart    the cart to search in
     * @param product the product to check for
     * @param size    the selected size of the product
     * @param userId  ID of the user who owns the cart
     * @return the existing CartItem if found, or null if not present
     */
    CartItem isCartItemExist(Cart cart, Product product, String size, Long userId);

    /**
     * Removes a cart item from the user's cart.
     * Validates that the requesting user owns the cart item.
     *
     * @param userId     ID of the user requesting the removal
     * @param cartItemId ID of the cart item to remove
     * @throws CartItemException if the cart item is not found
     * @throws UserException     if the user is not authorized to remove this item
     */
    void removeCartItem(Long userId, Long cartItemId) throws CartItemException, UserException;

    /**
     * Finds a cart item by its unique ID.
     *
     * @param cartItemId ID of the cart item to retrieve
     * @return the matching CartItem entity
     * @throws CartItemException if no cart item is found with the given ID
     */
    CartItem findCartItemById(Long cartItemId) throws CartItemException;
}