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
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    /** Display title of the product */
    private String title;

    /** Detailed description of the product */
    private String description;

    /** Material composition and detailing */
    private String materials;

    /** Fit and sizing instructions */
    private String fit;

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

    /** URL of the product's main image */
    private String imageUrl;

    /** Multiple image URLs for the product gallery */
    private List<String> images = new ArrayList<>();

    /** Top level category name (e.g. "collections", "atelier") */
    private String topLevelCategory;

    /** Second level category name (e.g. "silhouettes", "accents") */
    private String secondLevelCategory;

    /** Third level category name (e.g. "overcoats", "trousers") */
    private String thirdLevelCategory;
}