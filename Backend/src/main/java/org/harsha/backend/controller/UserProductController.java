package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * UserProductController
 *
 * Handles all public-facing product browsing endpoints.
 * Routes are accessible under /api and do not require admin privileges.
 *
 * Responsibilities:
 * - Browse and filter products by category, color, size, price, discount, and stock
 * - Fetch a single product by its ID
 * - Search products by keyword
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    /**
     * Retrieves a paginated list of products filtered by various criteria.
     *
     * @param category    product category to filter by
     * @param color       list of colors to filter by
     * @param size        list of sizes to filter by
     * @param minPrice    minimum price filter
     * @param maxPrice    maximum price filter
     * @param minDiscount minimum discount percentage filter
     * @param sort        sorting strategy (e.g. "price_low", "price_high")
     * @param stock       stock availability filter (e.g. "in_stock")
     * @param pageNumber  page index for pagination (0-based)
     * @param pageSize    number of products per page
     * @return paginated list of matching Product entities
     */
    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProductsByFilters(
            @RequestParam String category,
            @RequestParam List<String> color,
            @RequestParam List<String> size,
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice,
            @RequestParam Integer minDiscount,
            @RequestParam String sort,
            @RequestParam String stock,
            @RequestParam Integer pageNumber,
            @RequestParam Integer pageSize) {

        Page<Product> products = productService.getAllProduct(
                category, color, size, minPrice, maxPrice,
                minDiscount, sort, stock, pageNumber, pageSize
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(products);
    }

    /**
     * Retrieves a single product by its unique ID.
     *
     * @param productId ID of the product to fetch
     * @return the matching Product entity
     * @throws ProductException if no product is found with the given ID
     */
    @GetMapping("/products/id/{productId}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long productId) throws ProductException {

        Product product = productService.findProductById(productId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(product);
    }

    /**
     * Searches for products matching a keyword query.
     * Matches against product title, description, brand, or category.
     *
     * @param q the search keyword
     * @return list of matching Product entities
     */
    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String q) {

        List<Product> products = productService.searchProduct(q);
        return ResponseEntity.ok(products);
    }
}