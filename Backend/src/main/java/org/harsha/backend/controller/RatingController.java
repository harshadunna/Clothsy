package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Rating;
import org.harsha.backend.model.User;
import org.harsha.backend.request.RatingRequest;
import org.harsha.backend.service.RatingServices;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * RatingController
 *
 * Handles all product rating endpoints for authenticated users.
 * All routes are protected under /api/ratings and require a valid JWT.
 *
 * Responsibilities:
 * - Submit a rating for a product
 * - Retrieve all ratings for a specific product
 */
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final UserService userService;
    private final RatingServices ratingServices;

    /**
     * Submits a new rating for a product by the authenticated user.
     *
     * @param req request body containing product ID and rating value
     * @param jwt Authorization header containing the Bearer token
     * @return the newly created Rating entity
     */
    @PostMapping("/create")
    public ResponseEntity<Rating> createRating(
            @RequestBody RatingRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {

        User user = userService.findUserProfileByJwt(jwt);
        Rating rating = ratingServices.createRating(req, user);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(rating);
    }

    /**
     * Retrieves all ratings submitted for a specific product.
     *
     * @param productId ID of the product to fetch ratings for
     * @return list of Rating entities for the given product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getProductRatings(
            @PathVariable Long productId) {

        List<Rating> ratings = ratingServices.getProductsRating(productId);
        return ResponseEntity.ok(ratings);
    }
}