package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.CartItemRepository;
import org.harsha.backend.repository.CartRepository;
import org.harsha.backend.request.AddItemRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class CartServiceImplementation implements CartService {

    private final CartRepository cartRepository;
    private final CartItemService cartItemService;
    private final ProductService productService;
    private final UserService userService;
    private final CartItemRepository cartItemRepository;

    @Override
    public Cart createCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.save(cart);
    }

    @Override
    public Cart findUserCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);

        int totalPrice = 0;
        int totalDiscountedPrice = 0;
        int totalItem = 0;

        if (cart != null && cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                totalPrice += item.getPrice();
                totalDiscountedPrice += item.getDiscountedPrice();
                totalItem += item.getQuantity();
            }
        }

        cart.setTotalPrice(totalPrice);
        cart.setTotalDiscountedPrice(totalDiscountedPrice);
        cart.setDiscount(totalPrice - totalDiscountedPrice);
        cart.setTotalItem(totalItem);

        return cart;
    }

    @Override
    @Transactional
    public CartItem addCartItem(Long userId, AddItemRequest req) throws ProductException {
        if (req.getProductId() == null) {
            throw new ProductException("Product ID cannot be null when adding to cart");
        }

        Cart cart = cartRepository.findByUserId(userId);
        if (cart == null) {
            try {
                User user = userService.findUserById(userId);
                cart = createCart(user);
            } catch (Exception e) {
                throw new ProductException("Failed to find user or create cart: " + e.getMessage());
            }
        }

        Product product = productService.findProductById(req.getProductId());

        CartItem existingItem = cartItemService.isCartItemExist(cart, product, req.getSize(), userId);

        if (existingItem != null) {
            return existingItem;
        }

        CartItem cartItem = new CartItem();
        cartItem.setProduct(product);
        cartItem.setCart(cart);
        cartItem.setQuantity(req.getQuantity());
        cartItem.setUserId(userId);
        cartItem.setSize(req.getSize());

        cartItem.setPrice(req.getQuantity() * product.getPrice());
        cartItem.setDiscountedPrice(req.getQuantity() * product.getDiscountedPrice());

        CartItem createdCartItem = cartItemService.createCartItem(cartItem);

        if (cart.getCartItems() == null) {
            cart.setCartItems(new HashSet<>());
        }
        cart.getCartItems().add(createdCartItem);

        cartRepository.save(cart);

        return createdCartItem;
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId);
        if (cart != null && cart.getCartItems() != null) {

            // 1. Delete all the CartItems from the database first
            for (CartItem item : cart.getCartItems()) {
                cartItemRepository.delete(item);
            }

            // 2. Empty the memory Set and reset totals to 0
            cart.getCartItems().clear();
            cart.setTotalItem(0);
            cart.setTotalPrice(0);
            cart.setTotalDiscountedPrice(0);
            cart.setDiscount(0);

            // 3. Save the empty cart
            cartRepository.save(cart);
        }
    }
}