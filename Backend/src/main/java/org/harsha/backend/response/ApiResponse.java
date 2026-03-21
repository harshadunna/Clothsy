package org.harsha.backend.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ApiResponse
 *
 * Generic response payload returned to the client for operations
 * that don't return a specific entity (e.g. delete, update status).
 *
 * Provides a human-readable message and a boolean status flag
 * to indicate whether the operation was successful.
 *
 * Example response body:
 * {
 *   "message": "Product deleted successfully",
 *   "status": true
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {

    /** Human-readable message describing the outcome of the operation */
    private String message;

    /** Indicates whether the operation was successful */
    private boolean status;
}