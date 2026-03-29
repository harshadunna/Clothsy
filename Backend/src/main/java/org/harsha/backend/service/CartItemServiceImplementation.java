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
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartItemServiceImplementation implements CartItemService {

    private final CartItemRepository cartItemRepository;
    private final UserService userService;

    @Override
    public CartItem createCartItem(CartItem cartItem) {
        int quantity = cartItem.getQuantity() > 0 ? cartItem.getQuantity() : 1;
        cartItem.setQuantity(quantity);
        cartItem.setPrice(cartItem.getProduct().getPrice() * quantity);
        cartItem.setDiscountedPrice(cartItem.getProduct().getDiscountedPrice() * quantity);

        return cartItemRepository.save(cartItem);
    }

    @Override
    public CartItem updateCartItem(Long userId, Long id, CartItem cartItem) throws CartItemException, UserException {
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

    @Override
    public CartItem isCartItemExist(Cart cart, Product product, String size, Long userId) {
        return cartItemRepository.isCartItemExist(cart, product, size, userId);
    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) throws CartItemException, UserException {
        CartItem cartItem = findCartItemById(cartItemId);
        User itemOwner = userService.findUserById(cartItem.getUserId());

        if (!itemOwner.getId().equals(userId)) {
            throw new UserException("You are not authorized to remove another user's cart item");
        }

        cartItemRepository.deleteById(cartItem.getId());
    }

    @Override
    public CartItem findCartItemById(Long cartItemId) throws CartItemException {
        Optional<CartItem> opt = cartItemRepository.findById(cartItemId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new CartItemException("Cart item not found with id: " + cartItemId);
    }
}