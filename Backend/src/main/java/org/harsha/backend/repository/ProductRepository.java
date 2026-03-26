package org.harsha.backend.repository;

import org.harsha.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = :category")
    List<Product> findByCategory(@Param("category") String category);

    // FIX 2: Safely concatenated wildcards for cross-database compatibility
    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProduct(@Param("query") String query);

    // FIX 1: Split the BETWEEN clause so minPrice and maxPrice can operate independently
    @Query("SELECT p FROM Product p WHERE (:category = '' OR LOWER(p.category.name) = LOWER(:category)) " +
            "AND (:minPrice IS NULL OR p.discountedPrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.discountedPrice <= :maxPrice) " +
            "AND (:minDiscount IS NULL OR p.discountPercent >= :minDiscount) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'price_low' THEN p.discountedPrice END ASC, " +
            "CASE WHEN :sort = 'price_high' THEN p.discountedPrice END DESC")
    public List<Product> filterProducts(
            @Param("category") String category,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("minDiscount") Integer minDiscount,
            @Param("sort") String sort
    );

    List<Product> findTop10ByOrderByCreatedAtDesc();
}