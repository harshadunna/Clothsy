package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.User;
import org.harsha.backend.request.AddItemRequest;

public interface CartService {

    Cart createCart(User user);

    CartItem addCartItem(Long userId, AddItemRequest req) throws ProductException;

    Cart findUserCart(Long userId);

    // ── NEW: Method signature to clear the cart ──
    void clearCart(Long userId);
}