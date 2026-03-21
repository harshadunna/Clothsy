package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Rating;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.RatingRepository;
import org.harsha.backend.request.RatingRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * RatingServiceImplementation
 *
 * Concrete implementation of {@link RatingServices}.
 * Handles the business logic for creating and retrieving product ratings.
 */
@Service
@RequiredArgsConstructor
public class RatingServiceImplementation implements RatingServices {

    private final RatingRepository ratingRepository;
    private final ProductService productService;

    /**
     * Creates a new rating for a product after verifying the product exists.
     * Timestamps the rating at the moment of creation.
     */
    @Override
    public Rating createRating(RatingRequest req, User user) throws ProductException {

        Product product = productService.findProductById(req.getProductId());

        Rating rating = new Rating();
        rating.setProduct(product);
        rating.setUser(user);
        rating.setRating(req.getRating());
        rating.setCreatedAt(LocalDateTime.now());

        return ratingRepository.save(rating);
    }

    /**
     * Retrieves all ratings submitted for a specific product.
     */
    @Override
    public List<Rating> getProductsRating(Long productId) {
        return ratingRepository.getAllProductsRating(productId);
    }
}