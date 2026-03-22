package org.harsha.backend.repository;

import org.harsha.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ProductRepository
 *
 * Data access layer for the Product entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides custom queries for category filtering, keyword search,
 * advanced filtered browsing with sorting, and recent products.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Finds all products belonging to a specific category.
     * Case-insensitive match on the category name.
     *
     * @param category the category name to filter by (lowercase)
     * @return list of products in the given category
     */
    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = :category")
    List<Product> findByCategory(@Param("category") String category);

    /**
     * Searches for products matching a keyword across multiple fields.
     * Case-insensitive partial match on title, description, brand, and category name.
     *
     * @param query the search keyword
     * @return list of products matching the search query
     */
    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.title) LIKE %:query% OR " +
            "LOWER(p.description) LIKE %:query% OR " +
            "LOWER(p.brand) LIKE %:query% OR " +
            "LOWER(p.category.name) LIKE %:query%")
    List<Product> searchProduct(@Param("query") String query);

    /**
     * Filters products by category, price range, minimum discount, and sort order.
     *
     * - Category is optional — pass empty string to include all categories
     * - Price range is optional — pass null for both to skip price filtering
     * - Minimum discount is optional — pass null to skip discount filtering
     * - Supports sorting by price ascending ("price_low") or descending ("price_high")
     * - Falls back to sorting by newest first when no sort is specified
     *
     * @param category    category name to filter by, or empty string for all
     * @param minPrice    minimum discounted price filter (nullable)
     * @param maxPrice    maximum discounted price filter (nullable)
     * @param minDiscount minimum discount percentage filter (nullable)
     * @param sort        sort strategy ("price_low" or "price_high")
     * @return filtered and sorted list of products
     */
    @Query("SELECT p FROM Product p " +
            "WHERE (p.category.name = :category OR :category = '') " +
            "AND ((:minPrice IS NULL AND :maxPrice IS NULL) OR (p.discountedPrice BETWEEN :minPrice AND :maxPrice)) " +
            "AND (:minDiscount IS NULL OR p.discountPercent >= :minDiscount) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'price_low' THEN p.discountedPrice END ASC, " +
            "CASE WHEN :sort = 'price_high' THEN p.discountedPrice END DESC, " +
            "p.createdAt DESC")
    List<Product> filterProducts(
            @Param("category") String category,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("minDiscount") Integer minDiscount,
            @Param("sort") String sort
    );

    /**
     * Retrieves the 10 most recently added products.
     * Used for "New Arrivals" or "Recently Added" sections.
     *
     * @return list of the 10 newest products
     */
    List<Product> findTop10ByOrderByCreatedAtDesc();
}