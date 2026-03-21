package org.harsha.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * JWT Provider Service
 *
 * Responsible for all JWT operations in the application:
 * - Generating signed tokens upon successful authentication
 * - Extracting user information (email) from incoming tokens
 *
 * Uses HMAC-SHA algorithm with a secret key defined in {@link JwtConstant}.
 */
@Service
public class JwtProvider {

    /**
     * Cryptographic signing key built from the application's secret string.
     * Initialized once at startup — shared across all token operations.
     */
    private final SecretKey key = Keys.hmacShaKeyFor(
            JwtConstant.SECRET_KEY.getBytes()
    );

    /**
     * Generates a signed JWT token for an authenticated user.
     *
     * The token contains:
     * - Issued-at timestamp (iat)
     * - Expiration timestamp (exp) — 24 hours from now
     * - Custom claim: user's email address
     *
     * @param auth Spring Security Authentication object populated after login
     * @return compact, URL-safe signed JWT string (e.g. "eyJhbG...")
     */
    public String generateToken(Authentication auth) {

        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(86400L); // Token valid for 24 hours

        return Jwts.builder()
                .issuedAt(Date.from(now))           // Record when the token was issued
                .expiration(Date.from(expiry))      // Set token expiration to 24h from now
                .claim("email", auth.getName())     // Embed the user's email as a custom claim
                .signWith(key)                      // Sign with HMAC-SHA using our secret key
                .compact();                         // Serialize to compact JWT string format
    }

    /**
     * Extracts the user's email address from a raw JWT Authorization header value.
     *
     * Expects the header value in the format: "Bearer eyJhbG..."
     * Strips the "Bearer " prefix before parsing.
     *
     * @param jwt raw Authorization header value including "Bearer " prefix
     * @return the email address embedded in the token's claims
     * @throws io.jsonwebtoken.JwtException if the token is invalid, expired, or tampered with
     */
    public String getEmailFromToken(String jwt) {

        // Remove the "Bearer " prefix (7 characters) to get the raw token
        jwt = jwt.substring(7);

        // Parse the token, verify its signature, and extract the claims payload
        Claims claims = Jwts.parser()
                .verifyWith(key)            // Verify signature using our secret key
                .build()
                .parseSignedClaims(jwt)     // Parse and validate the signed JWT
                .getPayload();              // Get the claims body

        // Return the email stored as a custom claim during token generation
        return claims.get("email", String.class);
    }
}