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

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<Review> createReview(
            @RequestBody ReviewRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {

        User user = userService.findUserProfileByJwt(jwt);
        Review review = reviewService.createReview(req, user);

        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(
            @PathVariable Long productId) {

        List<Review> reviews = reviewService.getAllReview(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
}