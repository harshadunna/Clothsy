package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProductsByFilters(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> color,
            @RequestParam(required = false) List<String> size,
            @RequestParam(defaultValue = "0") Integer minPrice,
            @RequestParam(defaultValue = "1000000") Integer maxPrice,
            @RequestParam(defaultValue = "0") Integer minDiscount,
            @RequestParam(defaultValue = "price_low") String sort,
            @RequestParam(required = false) String stock,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "12") Integer pageSize,
            @RequestParam(required = false) String search) {

        System.out.println("Received category: " + category);
        
        Page<Product> products = productService.getAllProduct(
                category, color, size, minPrice, maxPrice,
                minDiscount, sort, stock, pageNumber, pageSize, search
        );

        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/id/{productId}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long productId) throws ProductException {

        Product product = productService.findProductById(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProduct(q);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productId}/recommendations")
    public ResponseEntity<List<Product>> getRecommendations(
            @PathVariable Long productId) throws ProductException {
        List<Product> recommendations = productService.getRecommendations(productId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/products/{productId}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(
            @PathVariable Long productId) throws ProductException {
        List<Product> similarProducts = productService.getSimilarProducts(productId);
        return ResponseEntity.ok(similarProducts);
    }

    @GetMapping("/products/curations/{tag}")
    public ResponseEntity<List<Product>> getCuratedProducts(@PathVariable String tag) {
        String normalizedTag = tag.toLowerCase();

        List<Product> products = productRepository.findByCurationTag(normalizedTag);

        if (products.isEmpty()) {
            if (normalizedTag.startsWith("mens-monolith")) {
                products = productRepository.findByCategoryFallback(
                        Arrays.asList("overcoats", "suits", "poplin-shirts", "trousers", "fine-knits"),
                        "men"
                );
            } else if (normalizedTag.startsWith("mens-urban")) {
                products = productRepository.findByCategoryFallback(
                        Arrays.asList("raw-denim", "boots", "overcoats"),
                        "men"
                );
            } else if (normalizedTag.startsWith("mens-heritage")) {
                products = productRepository.findByCategoryFallback(
                        Arrays.asList("suits", "briefcases", "watches"),
                        "men"
                );
            } else if (normalizedTag.contains("monolith")) {
                products = productRepository.findMonolithEditFallback();
            } else if (normalizedTag.contains("core")) {
                products = productRepository.findByCategoryFallback(
                        Arrays.asList("blouses", "womens-trousers", "knits", "jumpers"),
                        "women"
                );
            } else if (normalizedTag.contains("nocturnal")) {
                products = productRepository.findByCategoryFallback(
                        Arrays.asList("evening-dresses", "jewelry", "bags", "scarves"),
                        "women"
                );
            } else if (normalizedTag.contains("archive")) {
                products = productRepository.findArchiveSaleFallback();
            }
        }

        if (products.isEmpty()) {
            products = productRepository.findSafetyNetFallback();
        }

        return ResponseEntity.ok(products);
    }
}