package org.harsha.backend.repository;

import org.harsha.backend.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.reviews r " +
           "LEFT JOIN FETCH r.user " +
           "WHERE p.id = :id")
    Optional<Product> findByIdWithReviews(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.reviews r " +
           "LEFT JOIN FETCH r.user " +
           "WHERE p.id = :id")
    Optional<Product> findByIdFull(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = :category")
    List<Product> findByCategory(@Param("category") String category);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProduct(@Param("query") String query);

    @Query("SELECT p FROM Product p LEFT JOIN p.category c WHERE " +
           "(:category IS NULL OR :category = '' OR LOWER(c.name) = LOWER(:category)) " +
           "AND (:minPrice IS NULL OR COALESCE(p.discountedPrice, 0) >= :minPrice) " +
           "AND (:maxPrice IS NULL OR COALESCE(p.discountedPrice, 0) <= :maxPrice) " +
           "AND (:minDiscount IS NULL OR COALESCE(p.discountPercent, 0) >= :minDiscount) " +
           "ORDER BY " +
           "CASE WHEN :sort = 'price_low' THEN COALESCE(p.discountedPrice, 0) END ASC, " +
           "CASE WHEN :sort = 'price_high' THEN COALESCE(p.discountedPrice, 0) END DESC")
    List<Product> filterProducts(
            @Param("category") String category,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("minDiscount") Integer minDiscount,
            @Param("sort") String sort
    );

    List<Product> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Product p WHERE LOWER(p.curationTag) = LOWER(:tag)")
    List<Product> findByCurationTag(@Param("tag") String tag);

    @Query("SELECT p FROM Product p WHERE LOWER(p.color) LIKE '%black%' " +
            "AND LOWER(p.category.parentCategory.parentCategory.name) = 'women'")
    List<Product> findMonolithEditFallback();

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) IN (:categories) " +
            "AND LOWER(p.category.parentCategory.parentCategory.name) = LOWER(:gender)")
    List<Product> findByCategoryFallback(
            @Param("categories") List<String> categories,
            @Param("gender") String gender
    );

    @Query(value = "SELECT p.* FROM products p " +
            "JOIN categories c3 ON p.category_id = c3.id " +
            "JOIN categories c2 ON c3.parent_category_id = c2.id " +
            "JOIN categories c1 ON c2.parent_category_id = c1.id " +
            "WHERE LOWER(c1.name) = 'women' " +
            "ORDER BY RAND() LIMIT 16", nativeQuery = true)
    List<Product> findArchiveSaleFallback();

    @Query(value = "SELECT * FROM products LIMIT 12", nativeQuery = true)
    List<Product> findSafetyNetFallback();

    // CLOTHSY AI PAIRING QUERIES 

    @Query("SELECT p FROM Product p " +
            "JOIN p.category c " +
            "JOIN c.parentCategory mid " +
            "JOIN mid.parentCategory root " +
            "WHERE LOWER(root.name) = LOWER(:genderRoot) " +
            "AND LOWER(c.name) = LOWER(:categorySlug) " +
            "ORDER BY p.createdAt DESC")
    List<Product> findTopByGenderAndCategory(
            @Param("genderRoot") String genderRoot,
            @Param("categorySlug") String categorySlug,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p JOIN p.category c JOIN c.parentCategory mid JOIN mid.parentCategory root " +
            "WHERE LOWER(root.name) = LOWER(:genderRoot) AND LOWER(c.name) != LOWER(:excludedSlug) ORDER BY p.createdAt DESC")
    List<Product> findRecentByGenderExcludingCategory(
            @Param("genderRoot") String genderRoot,
            @Param("excludedSlug") String excludedSlug,
            Pageable pageable
    );
}