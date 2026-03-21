package org.harsha.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ErrorDetails
 *
 * Represents a structured error response payload returned to the client
 * when an exception is thrown during request processing.
 *
 * Typically constructed and returned by a global exception handler
 * (e.g. @ControllerAdvice) to provide consistent error responses.
 *
 * Example response body:
 * {
 *   "error": "User Not Found",
 *   "details": "No account found with email: test@example.com",
 *   "timestamp": "2024-01-15T10:30:00"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDetails {

    /** Short error title or type (e.g. "User Not Found") */
    private String error;

    /** Detailed explanation of what went wrong */
    private String details;

    /** Timestamp of when the error occurred */
    private LocalDateTime timestamp;
}