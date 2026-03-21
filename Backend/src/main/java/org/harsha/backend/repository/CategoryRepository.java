package org.harsha.backend.repository;

import org.harsha.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * CategoryRepository
 *
 * Data access layer for the Category entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides custom queries for looking up categories by name
 * and by name within a specific parent category.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Finds a category by its name.
     * Used to check for existing categories before creating new ones.
     *
     * @param name the name of the category to search for
     * @return the matching Category, or null if not found
     */
    Category findByName(String name);

    /**
     * Finds a category by its name and its parent category's name.
     * Used to locate subcategories within a specific parent category,
     * avoiding name conflicts across different levels of the hierarchy.
     *
     * @param name               the name of the category to search for
     * @param parentCategoryName the name of the parent category
     * @return the matching Category, or null if not found
     */
    @Query("SELECT c FROM Category c WHERE c.name = :name " +
            "AND c.parentCategory.name = :parentCategoryName")
    Category findByNameAndParent(
            @Param("name") String name,
            @Param("parentCategoryName") String parentCategoryName
    );
}