package org.harsha.backend.repository;

import org.harsha.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ReviewRepository
 *
 * Data access layer for the Review entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides a custom query to retrieve all reviews
 * submitted for a specific product.
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Retrieves all reviews submitted for a specific product.
     * Used to display the review list on the product detail page.
     *
     * @param productId the ID of the product to fetch reviews for
     * @return list of all Review entities for the given product
     */
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId")
    List<Review> getAllProductsReview(@Param("productId") Long productId);
}