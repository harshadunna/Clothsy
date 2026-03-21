package org.harsha.backend.exception;

/**
 * CartItemException
 *
 * Custom checked exception for cart item related errors.
 * Thrown when operations such as updating or removing a cart item
 * fail due to invalid input or unauthorized access.
 *
 * Example usage:
 *   throw new CartItemException("Cart item not found with id: " + cartItemId);
 */
public class CartItemException extends Exception {

    /**
     * Constructs a new CartItemException with a descriptive error message.
     *
     * @param message human-readable explanation of why the exception was thrown
     */
    public CartItemException(String message) {
        super(message);
    }
}