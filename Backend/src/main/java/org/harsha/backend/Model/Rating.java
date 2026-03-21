package org.harsha.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Rating Entity
 *
 * Represents a numerical rating given by a user to a product.
 * Maps to the "ratings" table in the database.
 *
 * Relationships:
 * - Many ratings can belong to one user
 * - Many ratings can belong to one product
 *
 * Both relationships use LAZY fetching — user and product data
 * are only loaded from the database when explicitly accessed,
 * improving performance for list queries.
 */
@Entity
@Table(name = "ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who submitted this rating.
     * LAZY fetched — not loaded unless explicitly accessed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The product being rated.
     * LAZY fetched — not loaded unless explicitly accessed.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Numerical rating value (e.g. 1.0 to 5.0) */
    private double rating;

    /** Timestamp of when this rating was submitted */
    private LocalDateTime createdAt;
}
