package org.harsha.backend.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthResponse
 *
 * Response payload returned to the client after successful
 * authentication (signup or signin).
 *
 * Contains the generated JWT token and a status flag
 * indicating whether the operation was successful.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /** JWT token to be included in subsequent authenticated requests */
    private String jwt;

    /** Indicates whether authentication was successful */
    private boolean status;
}