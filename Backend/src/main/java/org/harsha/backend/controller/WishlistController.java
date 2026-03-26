package org.harsha.backend.controller;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.User;
import org.harsha.backend.model.Wishlist;
import org.harsha.backend.service.UserService;
import org.harsha.backend.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;

    public WishlistController(WishlistService wishlistService, UserService userService) {
        this.wishlistService = wishlistService;
        this.userService = userService;
    }

    @GetMapping("/")
    public ResponseEntity<Wishlist> getWishlist(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Wishlist wishlist = wishlistService.getWishlistByUser(user);
        return ResponseEntity.ok(wishlist);
    }

    @PutMapping("/toggle/{productId}")
    public ResponseEntity<Wishlist> toggleWishlist(
            @PathVariable Long productId,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {
        User user = userService.findUserProfileByJwt(jwt);
        Wishlist wishlist = wishlistService.toggleWishlistItem(user, productId);
        return ResponseEntity.ok(wishlist);
    }
}