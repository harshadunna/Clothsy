package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * Cart Entity
 *
 * Represents a shopping cart belonging to a single user.
 * Maps to the "carts" table in the database.
 *
 * Each user has exactly one cart (One-to-One relationship).
 * The cart holds a set of CartItems, each representing a product
 * the user intends to purchase.
 *
 * Price fields are maintained and updated by the CartService
 * whenever items are added, removed, or modified.
 */
@Entity
@Table(name = "carts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"cartItems", "user"})
@ToString(exclude = {"cartItems", "user"})
public class Cart {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who owns this cart.
     * Excluded from JSON serialization to prevent infinite recursion
     * (Cart → User → Cart → ...).
     * LAZY fetched — user data is only loaded when explicitly accessed.
     */
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Set of items currently in the cart.
     * Uses a Set to prevent duplicate cart entries for the same product/size.
     * Cascade ALL + orphanRemoval ensures items are deleted with the cart.
     */
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CartItem> cartItems = new HashSet<>();

    /** Sum of original prices of all items in the cart */
    private double totalPrice;

    /** Total number of items currently in the cart */
    private int totalItem;

    /** Sum of discounted prices of all items in the cart */
    private int totalDiscountedPrice;

    /** Total discount amount saved (totalPrice - totalDiscountedPrice) */
    private int discount;
}