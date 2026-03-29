package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Review;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.repository.ReviewRepository;
import org.harsha.backend.request.ReviewRequest;
import org.harsha.backend.service.ReviewService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImplementation implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    /**
     * Creates and persists a new Review.
     *
     * FIX 1: Sets createdAt to LocalDateTime.now() — previously this was never set,
     *         causing the review card to fall back to "Recent" for every review.
     *
     * FIX 2: Saves req.getRating() directly onto the Review entity — previously the
     *         frontend made two separate API calls (one for rating, one for review)
     *         and the review card had no way to display the correct star value.
     */
    @Override
    public Review createReview(ReviewRequest req, User user) throws ProductException {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ProductException(
                        "Product not found with id: " + req.getProductId()));

        Review review = new Review();
        review.setReview(req.getReview());
        review.setRating(req.getRating());      
        review.setProduct(product);
        review.setUser(user);
        review.setCreatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getAllReview(Long productId) {
        return reviewRepository.getAllProductsReview(productId);
    }
}