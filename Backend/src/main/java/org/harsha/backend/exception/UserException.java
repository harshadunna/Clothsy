package org.harsha.backend.exception;

/**
 * UserException
 *
 * Custom checked exception for user-related errors in the application.
 * Thrown when operations such as user lookup, authentication,
 * or profile retrieval fail due to invalid input or missing data.
 *
 * Being a checked exception (extends Exception), callers are
 * forced to handle or declare it — making error handling explicit.
 *
 * Example usage:
 *   throw new UserException("User not found with id: " + userId);
 */
public class UserException extends Exception {

    /**
     * Constructs a new UserException with a descriptive error message.
     *
     * @param message human-readable explanation of why the exception was thrown
     */
    public UserException(String message) {
        super(message);
    }
}