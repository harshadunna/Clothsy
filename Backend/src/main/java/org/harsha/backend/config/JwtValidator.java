package org.harsha.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;

public class JwtValidator extends OncePerRequestFilter {

    // This method runs once per request to validate the JWT
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Read JWT token from request header
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);

        // Check if token is present
        if (jwt != null) {

            // Remove "Bearer " prefix from token
            jwt = jwt.substring(7);

            try {
                // Create HMAC signing key using secret key
                SecretKey key = Keys.hmacShaKeyFor(
                        JwtConstant.SECRET_KEY.getBytes()
                );

                // Parse and verify signed JWT and extract claims
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                // Extract user email from JWT claims
                String email = claims.get("email", String.class);

                // Extract authorities from JWT claims
                String authorities = claims.get("authorities", String.class);

                // Convert authorities string to GrantedAuthority list
                List<GrantedAuthority> auths =
                        AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);

                // Create authenticated user object
                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(email, null, auths);

                // Store authentication in security context
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception e) {
                // Throw exception if token validation fails
                throw new BadCredentialsException("Invalid Token from Jwt Validator");
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
