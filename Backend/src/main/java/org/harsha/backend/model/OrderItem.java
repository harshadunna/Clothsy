package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * OrderItem Entity
 *
 * Represents a single product line within an order.
 * Maps to the "order_items" table in the database.
 *
 * Each OrderItem captures the product, selected size, quantity,
 * and price at the time of purchase — preserving the order snapshot
 * even if the product price changes later.
 */
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The order this item belongs to.
     * Excluded from JSON serialization to prevent circular references
     * (Order → OrderItem → Order → ...).
     */
    @JsonIgnore
    @ManyToOne
    private Order order;

    /** The product included in this order line */
    @ManyToOne
    private Product product;

    /** Size selected for this product at the time of purchase */
    private String size;

    /** Number of units ordered */
    private int quantity;

    /** Original price per unit at time of purchase */
    private Integer price;

    /** Discounted price per unit at time of purchase */
    private Integer discountedPrice;

    /** ID of the user who placed this order item */
    private Long userId;

    /** Expected delivery date for this specific item */
    private LocalDateTime deliveryDate;

    /** Tracks the status of this specific item (e.g., PENDING, CONFIRMED, CANCELLED, RETURNED) */
    private String itemStatus = "PENDING";
}