package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.request.CreateProductRequest;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AdminProductController
 *
 * Handles all admin-level product management endpoints.
 * All routes are protected under /api/admin/products and
 * require authentication with admin privileges.
 *
 * Responsibilities:
 * - Create single or multiple products
 * - Update existing products
 * - Delete products
 * - Retrieve all or recently added products
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    /**
     * Creates a new product.
     *
     * @param req product details from request body
     * @return the newly created Product
     */
    @PostMapping("/")
    public ResponseEntity<Product> createProduct(@RequestBody CreateProductRequest req)
            throws ProductException {

        Product createdProduct = productService.createProduct(req);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(createdProduct);
    }

    /**
     * Deletes a product by its ID.
     *
     * @param productId ID of the product to delete
     * @return success message and status flag
     */
    @DeleteMapping("/{productId}/delete")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long productId)
            throws ProductException {

        String message = productService.deleteProduct(productId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponse(message, true));
    }

    /**
     * Retrieves all products in the store.
     *
     * @return list of all Product entities
     */
    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {

        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Retrieves the most recently added products.
     *
     * @return list of recently added Product entities
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Product>> getRecentProducts() {

        List<Product> products = productService.recentlyAddedProduct();
        return ResponseEntity.ok(products);
    }

    /**
     * Updates an existing product's details.
     *
     * @param productId ID of the product to update
     * @param req       updated product data from request body
     * @return the updated Product entity
     */
    @PutMapping("/{productId}/update")
    public ResponseEntity<Product> updateProduct(
            @RequestBody Product req,
            @PathVariable Long productId) throws ProductException {

        Product updatedProduct = productService.updateProduct(productId, req);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Creates multiple products in a single request.
     * Useful for bulk seeding or importing product catalogues.
     *
     * @param reqs array of product creation requests
     * @return success message confirming all products were created
     */
    @PostMapping("/creates")
    public ResponseEntity<ApiResponse> createMultipleProducts(
            @RequestBody CreateProductRequest[] reqs) throws ProductException {

        for (CreateProductRequest req : reqs) {
            productService.createProduct(req);
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse("Products created successfully", true));
    }
}