package org.harsha.backend.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Review Entity
 *
 * Represents a written review submitted by a user for a product.
 * Maps to the "reviews" table in the database.
 *
 * Relationships:
 * - Many reviews can belong to one product (product is hidden from JSON)
 * - Many reviews can belong to one user
 *
 * The product relationship is excluded from JSON serialization
 * to prevent circular references (Product → Review → Product → ...).
 */
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Written review text submitted by the user */
    private String review;

    /**
     * The product this review is written for.
     * Excluded from JSON serialization to prevent circular references.
     */
    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    /** The user who wrote this review */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    /** Timestamp of when this review was submitted */
    private LocalDateTime createdAt;
}