package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.CartRepository;
import org.harsha.backend.request.AddItemRequest;
import org.springframework.stereotype.Service;

/**
 * CartServiceImplementation
 *
 * Concrete implementation of {@link CartService}.
 * Handles all business logic for cart creation, item management,
 * and recalculation of cart totals on every retrieval.
 */
@Service
@RequiredArgsConstructor
public class CartServiceImplementation implements CartService {

    private final CartRepository cartRepository;
    private final CartItemService cartItemService;
    private final ProductService productService;

    /**
     * Creates a new empty cart for the given user and persists it.
     */
    @Override
    public Cart createCart(User user) {

        Cart cart = new Cart();
        cart.setUser(user);

        return cartRepository.save(cart);
    }

    /**
     * Retrieves the user's cart and recalculates all price totals
     * based on the current cart items before returning.
     */
    @Override
    public Cart findUserCart(Long userId) {

        Cart cart = cartRepository.findByUserId(userId);

        int totalPrice = 0;
        int totalDiscountedPrice = 0;
        int totalItem = 0;

        for (CartItem item : cart.getCartItems()) {
            totalPrice += item.getPrice();
            totalDiscountedPrice += item.getDiscountedPrice();
            totalItem += item.getQuantity();
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setDiscount(totalPrice - totalDiscountedPrice);
        cart.setTotalItem(totalItem);

        return cartRepository.save(cart);
    }

    /**
     * Adds a product to the cart if it doesn't already exist.
     * If the same product with the same size is already in the cart,
     * the existing CartItem is returned without creating a duplicate.
     */
    @Override
    public CartItem addCartItem(Long userId, AddItemRequest req) throws ProductException {

        Cart cart = cartRepository.findByUserId(userId);
        Product product = productService.findProductById(req.getProductId());

        // Return existing item if the same product + size is already in the cart
        CartItem existingItem = cartItemService.isCartItemExist(cart, product, req.getSize(), userId);
        if (existingItem != null) {
            return existingItem;
        }

        // Build a new cart item with price calculated from quantity × discounted price
        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setCart(cart);
        cartItem.setQuantity(req.getQuantity());
        cartItem.setUserId(userId);
        cartItem.setSize(req.getSize());
        cartItem.setPrice(req.getQuantity() * product.getDiscountedPrice());

        CartItem createdCartItem = cartItemService.createCartItem(cartItem);
        cart.getCartItems().add(createdCartItem);

        return createdCartItem;
    }
}