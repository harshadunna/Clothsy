package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.request.CreateProductRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    Product createProduct(CreateProductRequest req) throws ProductException;

    String deleteProduct(Long productId) throws ProductException;

    Product updateProduct(Long productId, Product req) throws ProductException;

    Product findProductById(Long id) throws ProductException;

    List<Product> findProductByCategory(String category);

    List<Product> searchProduct(String query);

    List<Product> getAllProducts();

    List<Product> recentlyAddedProduct();

    Page<Product> getAllProduct(
            String category,
            List<String> colors,
            List<String> sizes,
            Integer minPrice,
            Integer maxPrice,
            Integer minDiscount,
            String sort,
            String stock,
            Integer pageNumber,
            Integer pageSize,
            String search
    );

    List<Product> getRecommendedProducts(Long productId);

    List<Product> getRecommendations(Long productId) throws ProductException;

    List<Product> getSimilarProducts(Long productId) throws ProductException;

    List<Product> findAllProducts();
}