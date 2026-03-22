package org.harsha.backend.repository;

import org.harsha.backend.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * RatingRepository
 *
 * Data access layer for the Rating entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides a custom query to retrieve all ratings
 * submitted for a specific product.
 */
public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Retrieves all ratings submitted for a specific product.
     * Used to display the rating list and calculate average ratings
     * on the product detail page.
     *
     * @param productId the ID of the product to fetch ratings for
     * @return list of all Rating entities for the given product
     */
    @Query("SELECT r FROM Rating r WHERE r.product.id = :productId")
    List<Rating> getAllProductsRating(@Param("productId") Long productId);
}