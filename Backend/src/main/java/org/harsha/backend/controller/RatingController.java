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

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final UserService userService;
    private final RatingServices ratingServices;

    @PostMapping("/create")
    public ResponseEntity<Rating> createRating(
            @RequestBody RatingRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {

        User user = userService.findUserProfileByJwt(jwt);
        Rating rating = ratingServices.createRating(req, user);

        return new ResponseEntity<>(rating, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Rating>> getProductRatings(
            @PathVariable Long productId) {

        List<Rating> ratings = ratingServices.getProductsRating(productId);
        return new ResponseEntity<>(ratings, HttpStatus.OK);
    }
}