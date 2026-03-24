package org.harsha.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity
 *
 * Represents a placed order by a user in the ecommerce system.
 * Maps to the "orders" table in the database.
 *
 * Relationships:
 * - Belongs to one User (Many-to-One)
 * - Contains multiple OrderItems (One-to-Many)
 * - Linked to one shipping Address (Many-to-One)
 * - Embeds PaymentDetails directly into the table
 *
 * Price fields reflect the total cost breakdown at the time of order placement.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable order reference ID (e.g. "ORD-20240115-001") */
    private String orderId;

    /** The user who placed this order */
    @ManyToOne
    private User user;

    /**
     * List of items included in this order.
     * Cascade ALL + orphanRemoval ensures items are deleted with the order.
     */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    /** Date the order was placed — defaults to today */
    private LocalDate orderDate = LocalDate.now();

    /** Expected or actual delivery date */
    private LocalDate deliveryDate;

    /** Shipping address selected at checkout - FIXED TO MANY-TO-ONE */
    @ManyToOne
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    /**
     * Payment details embedded directly into the orders table.
     * No separate table is created for this.
     */
    @Embedded
    private PaymentDetails paymentDetails = new PaymentDetails();

    /** Total original price of all items before discounts */
    private double totalPrice;

    /** Total price after all discounts have been applied */
    private Integer totalDiscountedPrice;

    /** Total discount amount saved on this order */
    private Integer discount;

    /**
     * Current status of the order lifecycle.
     * (e.g. PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
     */
    private String orderStatus;

    /** Total number of items in this order */
    private int totalItem;

    /** Timestamp of when this order was created */
    private LocalDateTime createdAt;
}