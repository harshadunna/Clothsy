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
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class CartServiceImplementation implements CartService {

    private final CartRepository cartRepository;
    private final CartItemService cartItemService;
    private final ProductService productService;
    private final UserService userService;

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

        // Safely loop through items without crashing if it's completely empty
        if (cart.getCartItems() != null) {
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

        // THE GOLDEN RULE: Never call cartRepository.save(cart) in a GET request!
        // We just return the dynamically calculated cart to the frontend.
        return cart;
    }

    @Override
    @Transactional // Force Spring to lock the database and save everything together
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

        // Calculate prices properly
        cartItem.setPrice(req.getQuantity() * product.getPrice());
        cartItem.setDiscountedPrice(req.getQuantity() * product.getDiscountedPrice());

        // 1. Save the item to the database
        CartItem createdCartItem = cartItemService.createCartItem(cartItem);

        // 2. Attach the item to the cart in memory safely
        if (cart.getCartItems() == null) {
            cart.setCartItems(new HashSet<>());
        }
        cart.getCartItems().add(createdCartItem);

        // 3. Save the cart so the relationship is permanently locked
        cartRepository.save(cart);

        return createdCartItem;
    }
}