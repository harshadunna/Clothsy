package org.harsha.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Category Entity
 *
 * Represents a product category in the ecommerce store.
 * Maps to the "categories" table in the database.
 *
 * Supports a self-referencing hierarchy — a category can have
 * a parent category, enabling nested structures like:
 *
 *   Electronics (level 1)
 *     └── Phones (level 2)
 *           └── Smartphones (level 3)
 *
 * The level field indicates depth in the hierarchy (1 = top-level).
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Category {

    /** Auto-incremented primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Display name of the category.
     * Cannot be null and is limited to 50 characters.
     */
    @NotNull
    @Size(max = 50)
    private String name;

    /**
     * Parent category in the hierarchy.
     * Null for top-level categories.
     * EAGER fetched — parent info is almost always needed alongside the child.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_category_id")
    private Category parentCategory;

    /**
     * Depth level in the category hierarchy.
     * 1 = top-level, 2 = subcategory, 3 = sub-subcategory, etc.
     */
    private int level;
}
