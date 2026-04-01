package org.harsha.backend.repository;

import org.harsha.backend.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE LOWER(p.category.name) = :category")
    List<Product> findByCategory(@Param("category") String category);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProduct(@Param("query") String query);

    @Query("SELECT p FROM Product p WHERE (:category = '' OR LOWER(p.category.name) = LOWER(:category)) " +
            "AND (:minPrice IS NULL OR p.discountedPrice >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.discountedPrice <= :maxPrice) " +
            "AND (:minDiscount IS NULL OR p.discountPercent >= :minDiscount) " +
            "ORDER BY " +
            "CASE WHEN :sort = 'price_low' THEN p.discountedPrice END ASC, " +
            "CASE WHEN :sort = 'price_high' THEN p.discountedPrice END DESC")
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
            "AND LOWER(p.category.parentCategory.parentCategory.name) = 'collections'")
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
            "WHERE LOWER(c1.name) = 'collections' " +
            "ORDER BY RAND() LIMIT 16", nativeQuery = true)
    List<Product> findArchiveSaleFallback();

    @Query(value = "SELECT * FROM products LIMIT 12", nativeQuery = true)
    List<Product> findSafetyNetFallback();

    // CLOTHSY AI PAIRING QUERIES 
    
    // 1. Strict match ensuring the Top-Level Category (Gender) is respected
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

    // 2. Fallback fill-in ensuring the SAME GENDER is respected
    @Query("SELECT p FROM Product p JOIN p.category c JOIN c.parentCategory mid JOIN mid.parentCategory root " +
           "WHERE LOWER(root.name) = LOWER(:genderRoot) AND LOWER(c.name) != LOWER(:excludedSlug) ORDER BY p.createdAt DESC")
    List<Product> findRecentByGenderExcludingCategory(
        @Param("genderRoot") String genderRoot, 
        @Param("excludedSlug") String excludedSlug, 
        Pageable pageable
    );
}