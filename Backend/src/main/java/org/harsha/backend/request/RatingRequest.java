package org.harsha.backend.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * RatingRequest
 *
 * Request payload received from the client when submitting
 * a numerical rating for a product.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {

    /** ID of the product being rated */
    private Long productId;

    /** Numerical rating value submitted by the user (e.g. 1.0 to 5.0) */
    private double rating;
}