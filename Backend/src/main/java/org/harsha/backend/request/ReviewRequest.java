package org.harsha.backend.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ReviewRequest
 *
 * Request payload received from the client when submitting
 * a written review for a product.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    /** ID of the product being reviewed */
    private Long productId;

    /** Written review text submitted by the user */
    private String review;
}