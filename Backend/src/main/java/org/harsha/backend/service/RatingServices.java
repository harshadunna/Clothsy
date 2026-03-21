package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Rating;
import org.harsha.backend.model.User;
import org.harsha.backend.request.RatingRequest;

import java.util.List;

/**
 * RatingServices Interface
 *
 * Defines the contract for all product rating business operations.
 * Implementations handle creating and retrieving product ratings.
 */
public interface RatingServices {

    /**
     * Creates a new rating for a product by the given user.
     *
     * @param req  request containing product ID and rating value
     * @param user the authenticated user submitting the rating
     * @return the newly created Rating entity
     * @throws ProductException if the product is not found
     */
    Rating createRating(RatingRequest req, User user) throws ProductException;

    /**
     * Retrieves all ratings submitted for a specific product.
     *
     * @param productId ID of the product to fetch ratings for
     * @return list of all Rating entities for the given product
     */
    List<Rating> getProductsRating(Long productId);
}