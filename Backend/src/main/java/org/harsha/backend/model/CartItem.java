package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.NoArgsConstructor;

/**
 * CartItem Entity
 *
 * Represents a single product entry inside a user's cart.
 * Maps to the "cart_items" table in the database.
 *
 * Each CartItem links a specific product (with a chosen size and quantity)
 * to a cart. Price fields are calculated and stored at the time the item
 * is added, reflecting any active discounts.
 */
@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "cart")
@ToString(exclude = "cart")
public class CartItem {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The cart this item belongs to.
     * Excluded from JSON serialization to prevent circular references
     * (Cart → CartItem → Cart → ...).
     */
    @JsonIgnore
    @ManyToOne
    private Cart cart;

    /** The product added to the cart */
    @ManyToOne
    private Product product;

    /** Selected size for this cart item (e.g. "M", "L", "42") */
    private String size;

    /** Number of units of this product added to the cart */
    private int quantity;

    /** Original price of the item at the time it was added */
    private Integer price;

    /** Discounted price of the item after applying any active offers */
    private Integer discountedPrice;

    /**
     * ID of the user who owns this cart item.
     * Stored directly for quick access without joining through Cart → User.
     */
    private Long userId;
}