package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.User;
import org.harsha.backend.model.Wishlist;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.repository.WishlistRepository;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    public Wishlist getWishlistByUser(User user) {
        Wishlist wishlist = wishlistRepository.findByUserId(user.getId());
        if (wishlist == null) {
            wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist = wishlistRepository.save(wishlist);
        }
        return wishlist;
    }

    public Wishlist toggleWishlistItem(User user, Long productId) throws ProductException {
        Wishlist wishlist = getWishlistByUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductException("Product not found"));

        if (wishlist.getProducts().contains(product)) {
            wishlist.getProducts().remove(product);
        } else {
            wishlist.getProducts().add(product);
        }

        return wishlistRepository.save(wishlist);
    }
}