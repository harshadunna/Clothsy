package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;

    @ManyToOne
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<OrderItem> orderItems = new ArrayList<>();

    private LocalDate orderDate;
    private LocalDate deliveryDate;

    @ManyToOne
    @JoinColumn(name = "shipping_address_id")
    private Address shippingAddress;

    @Embedded
    private PaymentDetails paymentDetails = new PaymentDetails();

    private double totalPrice;
    private Integer totalDiscountedPrice;
    private Integer discount;

    private String orderStatus;
    private int totalItem;

    private LocalDateTime createdAt;

    private String trackingNumber;
    private LocalDateTime shippedAt;
    private LocalDateTime estimatedDeliveryAt;
    private LocalDateTime returnRequestedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_tracking_history", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "tracking_event")
    private List<String> trackingHistory = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (orderDate == null) orderDate = LocalDate.now();
    }
}