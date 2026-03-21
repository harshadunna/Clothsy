package org.harsha.backend.exception;

/**
 * ProductException
 *
 * Custom checked exception for product-related errors in the application.
 * Thrown when operations such as creating, updating, or retrieving
 * a product fail due to invalid input or missing data.
 *
 * Example usage:
 *   throw new ProductException("Product not found with id: " + productId);
 */
public class ProductException extends Exception {

    /**
     * Constructs a new ProductException with a descriptive error message.
     *
     * @param message human-readable explanation of why the exception was thrown
     */
    public ProductException(String message) {
        super(message);
    }
}