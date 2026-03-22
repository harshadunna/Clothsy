package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.User;
import org.harsha.backend.request.AddItemRequest;
import org.harsha.backend.service.CartService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CartController
 *
 * Handles all cart-related endpoints for authenticated users.
 * All routes are protected under /api/cart and require a valid JWT.
 *
 * Responsibilities:
 * - Retrieve the current user's cart
 * - Add items to the cart
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    /**
     * Retrieves the cart belonging to the authenticated user.
     *
     * @param jwt Authorization header containing the Bearer token
     * @return the user's Cart with all cart items
     */
    @GetMapping("/")
    public ResponseEntity<Cart> findUserCart(
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Cart cart = cartService.findUserCart(user.getId());

        return ResponseEntity.ok(cart);
    }

    /**
     * Adds an item to the authenticated user's cart.
     * If the item already exists, quantity is updated accordingly.
     *
     * @param req request body containing product ID, size, and quantity
     * @param jwt Authorization header containing the Bearer token
     * @return the newly added or updated CartItem
     */
    @PutMapping("/add")
    public ResponseEntity<CartItem> addItemToCart(
            @RequestBody AddItemRequest req,
            @RequestHeader("Authorization") String jwt) throws UserException, ProductException {

        User user = userService.findUserProfileByJwt(jwt);
        CartItem item = cartService.addCartItem(user.getId(), req);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(item);
    }
}