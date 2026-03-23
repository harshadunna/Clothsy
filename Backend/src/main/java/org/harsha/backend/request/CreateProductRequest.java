package org.harsha.backend.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.harsha.backend.model.Size;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * CreateProductRequest
 *
 * Request payload received from the admin when creating a new product.
 * Contains all the details needed to build and persist a Product entity.
 *
 * Category hierarchy is passed as three separate string fields
 * representing the top, second, and third level categories
 * (e.g. "Men" → "Clothing" → "T-Shirts").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    /** Display title of the product */
    private String title;

    /** Detailed description of the product */
    private String description;

    /** Original price of the product */
    private int price;

    /** Price after discount is applied */
    private int discountedPrice;

    /** Discount percentage (e.g. 20 means 20% off) */
    private int discountPercent;

    /** Number of units available in stock */
    private int quantity;

    /** Brand name of the product */
    private String brand;

    /** Primary color of the product */
    private String color;

    /** Available size variants with their stock quantities */
    private Set<Size> sizes = new HashSet<>();

    /** URL of the product's main image — kept for backward compatibility */
    private String imageUrl;

    /** Multiple image URLs for the product gallery */
    private List<String> images = new ArrayList<>();

    /** Top level category name (e.g. "Men", "Women") */
    private String topLevelCategory;

    /** Second level category name (e.g. "Clothing", "Footwear") */
    private String secondLevelCategory;

    /** Third level category name (e.g. "T-Shirts", "Sneakers") */
    private String thirdLevelCategory;
}