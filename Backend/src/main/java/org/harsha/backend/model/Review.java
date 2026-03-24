package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Review Entity
 *
 * Represents a written review AND star rating submitted by a user for a product.
 * The 'rating' field (1-5) is now stored directly on the review so each review
 * card can display the correct star value without a separate lookup.
 *
 * Relationships:
 * - Many reviews can belong to one product (product is hidden from JSON)
 * - Many reviews can belong to one user
 */
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String review;

    /** Star rating attached to this review (1–5). */
    private double rating;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;
}