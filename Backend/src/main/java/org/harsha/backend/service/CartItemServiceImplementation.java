package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.CartItemException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Cart;
import org.harsha.backend.model.CartItem;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.User;
import org.harsha.backend.repository.CartItemRepository;

import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * CartItemServiceImplementation
 *
 * Concrete implementation of {@link CartItemService}.
 * Handles all business logic for managing individual cart items,
 * including creation, updates, ownership validation, and removal.
 */
@Service
@RequiredArgsConstructor
public class CartItemServiceImplementation implements CartItemService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;

    /**
     * Creates a new cart item with default quantity of 1.
     * Calculates both the original and discounted price on creation.
     */
    @Override
    public CartItem createCartItem(CartItem cartItem) {

        cartItem.setQuantity(1);
        cartItem.setPrice(cartItem.getProduct().getPrice() * cartItem.getQuantity());
        cartItem.setDiscountedPrice(cartItem.getProduct().getDiscountedPrice() * cartItem.getQuantity());

        return cartItemRepository.save(cartItem);
    }

    /**
     * Updates the quantity and recalculates prices for an existing cart item.
     * Throws an exception if the requesting user does not own the cart item.
     */
    @Override
    public CartItem updateCartItem(Long userId, Long id, CartItem cartItem)
            throws CartItemException, UserException {

        CartItem existingItem = findCartItemById(id);
        User itemOwner = userService.findUserById(existingItem.getUserId());

        if (!itemOwner.getId().equals(userId)) {
            throw new CartItemException("You are not authorized to update another user's cart item");
        }

        existingItem.setQuantity(cartItem.getQuantity());
        existingItem.setPrice(existingItem.getQuantity() * existingItem.getProduct().getPrice());
        existingItem.setDiscountedPrice(existingItem.getQuantity() * existingItem.getProduct().getDiscountedPrice());

        return cartItemRepository.save(existingItem);
    }

    /**
     * Checks whether a matching cart item already exists for the given
     * cart, product, size, and user combination.
     */
    @Override
    public CartItem isCartItemExist(Cart cart, Product product, String size, Long userId) {
        return cartItemRepository.isCartItemExist(cart, product, size, userId);
    }

    /**
     * Removes a cart item after verifying the requesting user owns it.
     * Throws an exception if the user is not authorized to remove the item.
     */
    @Override
    public void removeCartItem(Long userId, Long cartItemId)
            throws CartItemException, UserException {

        CartItem cartItem = findCartItemById(cartItemId);
        User itemOwner = userService.findUserById(cartItem.getUserId());

        if (!itemOwner.getId().equals(userId)) {
            throw new UserException("You are not authorized to remove another user's cart item");
        }

        cartItemRepository.deleteById(cartItem.getId());
    }

    /**
     * Finds a cart item by its ID.
     * Throws CartItemException if no item exists with the given ID.
     */
    @Override
    public CartItem findCartItemById(Long cartItemId) throws CartItemException {

        Optional<CartItem> opt = cartItemRepository.findById(cartItemId);

        if (opt.isPresent()) {
            return opt.get();
        }

        throw new CartItemException("Cart item not found with id: " + cartItemId);
    }
}