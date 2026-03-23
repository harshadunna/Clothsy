package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;

    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProductsByFilters(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> color,
            @RequestParam(required = false) List<String> size,
            @RequestParam(defaultValue = "0") Integer minPrice,
            @RequestParam(defaultValue = "10000") Integer maxPrice,
            @RequestParam(defaultValue = "0") Integer minDiscount,
            @RequestParam(defaultValue = "price_low") String sort,
            @RequestParam(required = false) String stock,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "12") Integer pageSize) {

        Page<Product> products = productService.getAllProduct(
                category, color, size, minPrice, maxPrice,
                minDiscount, sort, stock, pageNumber, pageSize
        );

        // FIX: Use 200 OK for successful GET requests instead of 202 ACCEPTED
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/id/{productId}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long productId) throws ProductException {

        Product product = productService.findProductById(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam String q) {

        List<Product> products = productService.searchProduct(q);
        return ResponseEntity.ok(products);
    }
}