package org.harsha.backend.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginRequest
 *
 * Request payload received from the client during signin.
 * Contains the user's credentials for authentication.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /** Email address used as the login identifier */
    private String email;

    /** Raw password provided by the user (matched against stored BCrypt hash) */
    private String password;
}