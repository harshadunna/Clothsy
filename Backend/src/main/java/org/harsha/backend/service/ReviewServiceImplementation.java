package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Review;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.ReviewRepository;
import org.harsha.backend.request.ReviewRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ReviewServiceImplementation
 *
 * Concrete implementation of {@link ReviewService}.
 * Handles the business logic for creating and retrieving product reviews.
 */
@Service
@RequiredArgsConstructor
public class ReviewServiceImplementation implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductService productService;

    /**
     * Creates a new review for a product after verifying the product exists.
     * Timestamps the review at the moment of creation.
     */
    @Override
    public Review createReview(ReviewRequest req, User user) throws ProductException {

        Product product = productService.findProductById(req.getProductId());

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setReview(req.getReview());
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * Retrieves all reviews submitted for a specific product.
     */
    @Override
    public List<Review> getAllReview(Long productId) {
        return reviewRepository.getAllProductsReview(productId);
    }
}