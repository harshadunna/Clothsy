package org.harsha.backend.exception;

/**
 * OrderException
 *
 * Custom checked exception for order-related errors in the application.
 * Thrown when operations such as placing, updating, or retrieving
 * an order fail due to invalid input or missing data.
 *
 * Example usage:
 *   throw new OrderException("Order not found with id: " + orderId);
 */
public class OrderException extends Exception {

    /**
     * Constructs a new OrderException with a descriptive error message.
     *
     * @param message human-readable explanation of why the exception was thrown
     */
    public OrderException(String message) {
        super(message);
    }
}