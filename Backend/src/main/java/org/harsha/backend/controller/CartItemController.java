package org.harsha.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.CartItemException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.User;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.CartItemService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * CartItemController
 *
 * Handles cart item level operations for authenticated users.
 * All routes are protected under /api/cart_items and require a valid JWT.
 *
 * Responsibilities:
 * - Remove an item from the cart
 * - Update quantity or size of an existing cart item
 */
@RestController
@RequestMapping("/api/cart_items")
@RequiredArgsConstructor
@Tag(name = "Cart Item Management", description = "Add, update, and remove cart items")
public class CartItemController {

    private final CartItemService cartItemService;
    private final UserService userService;

    /**
     * Removes a specific item from the authenticated user's cart.
     *
     * @param cartItemId ID of the cart item to remove
     * @param jwt        Authorization header containing the Bearer token
     * @return success message and status flag
     */
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<ApiResponse> removeCartItem(
            @PathVariable Long cartItemId,
            @RequestHeader("Authorization") String jwt) throws CartItemException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        cartItemService.removeCartItem(user.getId(), cartItemId);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse("Item removed from cart successfully", true));
    }

    /**
     * Updates an existing cart item (e.g. quantity or size).
     *
     * @param cartItemId ID of the cart item to update
     * @param cartItem   request body containing updated cart item details
     * @param jwt        Authorization header containing the Bearer token
     * @return the updated CartItem entity
     */
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody CartItem cartItem,
            @RequestHeader("Authorization") String jwt) throws CartItemException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        CartItem updatedCartItem = cartItemService.updateCartItem(user.getId(), cartItemId, cartItem);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(updatedCartItem);
    }
}