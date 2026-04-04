package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    private String size;
    private int quantity;
    private Integer price;
    private Integer discountedPrice;
    private Long userId;

    /**
     * Timestamp when this item was delivered.
     * Used to calculate the 7-day return eligibility window.
     */
    private LocalDateTime deliveryDate;

    /**
     * Valid values: PENDING → PLACED → CONFIRMED → SHIPPED → DELIVERED
     *   → CANCELLED
     *   → RETURN_REQUESTED → RETURN_PICKED → RETURN_RECEIVED
     *   → REFUND_INITIATED → REFUND_COMPLETED
     */
    private String itemStatus = "PENDING";
}