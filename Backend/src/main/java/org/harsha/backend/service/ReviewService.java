package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Review;
import org.harsha.backend.model.User;
import org.harsha.backend.request.ReviewRequest;

import java.util.List;

/**
 * ReviewService Interface
 *
 * Defines the contract for all product review business operations.
 * Implementations handle creating and retrieving product reviews.
 */
public interface ReviewService {

    /**
     * Creates a new written review for a product by the given user.
     *
     * @param req  request containing product ID and review text
     * @param user the authenticated user submitting the review
     * @return the newly created Review entity
     * @throws ProductException if the product is not found
     */
    Review createReview(ReviewRequest req, User user) throws ProductException;

    /**
     * Retrieves all reviews submitted for a specific product.
     *
     * @param productId ID of the product to fetch reviews for
     * @return list of all Review entities for the given product
     */
    List<Review> getAllReview(Long productId);
}