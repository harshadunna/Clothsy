package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Review;
import org.harsha.backend.model.User;
import org.harsha.backend.request.ReviewRequest;
import org.harsha.backend.service.ReviewService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ReviewController
 *
 * Handles all product review endpoints for authenticated users.
 * All routes are protected under /api/reviews and require a valid JWT.
 *
 * Responsibilities:
 * - Submit a written review for a product
 * - Retrieve all reviews for a specific product
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    /**
     * Submits a new written review for a product by the authenticated user.
     *
     * @param req request body containing product ID and review text
     * @param jwt Authorization header containing the Bearer token
     * @return the newly created Review entity
     */
    @PostMapping("/create")
    public ResponseEntity<Review> createReview(
            @RequestBody ReviewRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {

        User user = userService.findUserProfileByJwt(jwt);
        Review review = reviewService.createReview(req, user);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(review);
    }

    /**
     * Retrieves all reviews submitted for a specific product.
     *
     * @param productId ID of the product to fetch reviews for
     * @return list of Review entities for the given product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(
            @PathVariable Long productId) {

        List<Review> reviews = reviewService.getAllReview(productId);
        return ResponseEntity.ok(reviews);
    }
}