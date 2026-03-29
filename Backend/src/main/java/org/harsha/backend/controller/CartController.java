package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.User;
import org.harsha.backend.request.AddItemRequest;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.CartService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping("/")
    public ResponseEntity<Cart> findUserCart(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        Cart cart = cartService.findUserCart(user.getId());
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }

    @PutMapping("/add")
    public ResponseEntity<CartItem> addItemToCart(@RequestBody AddItemRequest req,
                                                  @RequestHeader("Authorization") String jwt) throws UserException, ProductException {
        User user = userService.findUserProfileByJwt(jwt);
        CartItem item = cartService.addCartItem(user.getId(), req);
        return new ResponseEntity<>(item, HttpStatus.OK);
    }

    // Endpoint to trigger the clear cart method
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse> clearCart(@RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserProfileByJwt(jwt);
        cartService.clearCart(user.getId());

        ApiResponse res = new ApiResponse("Cart cleared successfully", true);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}