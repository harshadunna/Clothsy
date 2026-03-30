package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
 *
 * BIDIRECTIONAL RELATIONSHIP WITH Order:
 * - Order (parent)    → @OneToMany  → List<OrderItem>  @JsonManagedReference
 * - OrderItem (child) → @ManyToOne  → Order            @JsonBackReference
 *
 * @JsonBackReference suppresses the "order" field during JSON serialization
 * to prevent infinite circular reference:
 * Order → OrderItem → Order → OrderItem → ...
 *
 * @JoinColumn(name = "order_id", nullable = false) explicitly tells
 * Hibernate which column is the foreign key. Without this, Hibernate
 * guesses the column name and can silently write NULL, causing orphaned rows.
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
     * The parent Order this item belongs to.
     *
     * @ManyToOne         — many items can belong to one order
     * @JoinColumn        — explicitly maps the order_id FK column (nullable = false
     *                      ensures Hibernate never writes a NULL foreign key)
     * @JsonBackReference — excluded from JSON output to break circular serialization
     */
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /**
     * The product included in this order line.
     * Loaded eagerly via JOIN FETCH in repository queries so product
     * details (name, image, etc.) are always available in the response.
     */
    @ManyToOne
    private Product product;

    /** Size selected for this product at the time of purchase (e.g. "M", "XL") */
    private String size;

    /** Number of units ordered */
    private int quantity;

    /**
     * Original price per unit at time of purchase.
     * Stored as a snapshot — unaffected by future product price changes.
     */
    private Integer price;

    /**
     * Discounted price per unit at time of purchase.
     * Stored as a snapshot — unaffected by future discount changes.
     */
    private Integer discountedPrice;

    /** ID of the user who placed this order item */
    private Long userId;

    /**
     * Timestamp when this specific item was delivered.
     * Used to calculate the 7-day return eligibility window.
     * Null until the item reaches DELIVERED status.
     */
    private LocalDateTime deliveryDate;

    /**
     * Lifecycle status of this individual item.
     *
     * Valid transitions:
     * PENDING → PLACED → CONFIRMED → SHIPPED → DELIVERED
     *                                        → CANCELLED (at any point before DELIVERED)
     *                                        → RETURN_REQUESTED → RETURN_PICKED
     *                                          → RETURN_RECEIVED → REFUND_INITIATED
     *                                          → REFUND_COMPLETED
     */
    private String itemStatus = "PENDING";
}