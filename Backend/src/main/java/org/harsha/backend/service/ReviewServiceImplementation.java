package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Review;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.repository.ReviewRepository;
import org.harsha.backend.request.ReviewRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImplementation implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Review createReview(ReviewRequest req, User user) throws ProductException {
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ProductException(
                        "Product not found with id: " + req.getProductId()));

        // 1. Create and save the new review
        Review review = new Review();
        review.setReview(req.getReview());
        review.setRating(req.getRating());      
        review.setProduct(product);
        review.setUser(user);
        review.setCreatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        // 2. Fetch all reviews to calculate the new true average
        List<Review> allReviews = reviewRepository.getAllProductsReview(product.getId());
        
        double totalRating = 0;
        for (Review r : allReviews) {
            totalRating += r.getRating();
        }
        
        // 3. Calculate the average (with a safety check to prevent division by zero)
        int totalReviewCount = allReviews.size();
        double averageRating = totalReviewCount > 0 ? (totalRating / totalReviewCount) : 0.0;

        // 4. Update the Product entity so the frontend can display the accurate stars
        product.setNumRatings(totalReviewCount);
        
        product.setAverageRating(averageRating); 

        productRepository.save(product);

        return savedReview;
    }

    @Override
    public List<Review> getAllReview(Long productId) {
        return reviewRepository.getAllProductsReview(productId);
    }
}