package org.harsha.backend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Product Entity
 *
 * Represents a product listed in the ecommerce store.
 * Maps to the "products" table in the database.
 *
 * Relationships:
 * - Belongs to one Category (Many-to-One)
 * - Has multiple Ratings (One-to-Many)
 * - Has multiple Reviews (One-to-Many)
 * - Has multiple Sizes stored as an embedded element collection
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    /** Original price of the product in smallest currency unit */
    private int price;

    /** Price after discount is applied */
    private int discountedPrice;

    /** Discount percentage (e.g. 20 means 20% off) */
    private int discountPercent;

    /** Number of items available in stock */
    private int quantity;

    private String brand;
    private String color;
    private String imageUrl;

    /**
     * Available sizes for this product (e.g. S, M, L, XL).
     * Stored as a separate element collection table — not a full entity.
     */
    @ElementCollection
    private Set<Size> sizes = new HashSet<>();

    /**
     * All ratings submitted for this product.
     * Cascade ALL + orphanRemoval ensures ratings are deleted with the product.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> ratings = new ArrayList<>();

    /**
     * All reviews written for this product.
     * Cascade ALL + orphanRemoval ensures reviews are deleted with the product.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();

    /** Cached count of total ratings — avoids querying ratings list size each time */
    private int numRatings;

    /**
     * Category this product belongs to.
     * LAZY fetching by default for Many-to-One — loaded only when accessed.
     */
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    /** Timestamp of when this product was listed in the store */
    private LocalDateTime createdAt;
}