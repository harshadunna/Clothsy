package org.harsha.backend.request;

import lombok.Data;

/**
 * ReviewRequest DTO
 *
 * Carries the data submitted from the frontend when a user writes a review.
 * Now includes 'rating' so a single API call saves both the review text
 * and the star value — removing the need for a separate /api/ratings/create call.
 */
@Data
public class ReviewRequest {

    private Long productId;

    private String review;

    /** Star rating 1–5 submitted alongside the review text. */
    private double rating;
}