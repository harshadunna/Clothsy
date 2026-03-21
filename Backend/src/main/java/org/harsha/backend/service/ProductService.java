package org.harsha.backend.service;

import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.request.CreateProductRequest;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * ProductService Interface
 *
 * Defines the contract for all product-related business operations.
 * Covers admin operations (create, update, delete) and
 * user-facing operations (browse, filter, search).
 */
public interface ProductService {

    /**
     * Creates a new product and builds the category hierarchy if needed.
     *
     * @param req request containing all product details and category names
     * @return the newly created Product entity
     * @throws ProductException if product creation fails
     */
    Product createProduct(CreateProductRequest req) throws ProductException;

    /**
     * Deletes a product by its ID.
     *
     * @param productId ID of the product to delete
     * @return success message confirming deletion
     * @throws ProductException if no product is found with the given ID
     */
    String deleteProduct(Long productId) throws ProductException;

    /**
     * Updates an existing product's details.
     *
     * @param productId ID of the product to update
     * @param product   updated product data
     * @return the updated Product entity
     * @throws ProductException if no product is found with the given ID
     */
    Product updateProduct(Long productId, Product product) throws ProductException;

    /**
     * Retrieves all products in the store.
     *
     * @return list of all Product entities
     */
    List<Product> getAllProducts();

    /**
     * Finds a product by its unique ID.
     *
     * @param id ID of the product to retrieve
     * @return the matching Product entity
     * @throws ProductException if no product is found with the given ID
     */
    Product findProductById(Long id) throws ProductException;

    /**
     * Retrieves all products belonging to a specific category.
     *
     * @param category the category name to filter by
     * @return list of products in the given category
     */
    List<Product> findProductByCategory(String category);

    /**
     * Searches for products matching a keyword across multiple fields.
     *
     * @param query the search keyword
     * @return list of matching Product entities
     */
    List<Product> searchProduct(String query);

    /**
     * Retrieves a paginated, filtered, and sorted list of products.
     *
     * @param category    category name to filter by
     * @param colors      list of colors to filter by
     * @param sizes       list of sizes to filter by
     * @param minPrice    minimum price filter
     * @param maxPrice    maximum price filter
     * @param minDiscount minimum discount percentage filter
     * @param sort        sort strategy ("price_low" or "price_high")
     * @param stock       stock filter ("in_stock" or "out_of_stock")
     * @param pageNumber  page index (0-based)
     * @param pageSize    number of products per page
     * @return paginated list of matching Product entities
     */
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
            Integer pageSize
    );

    /**
     * Retrieves the 10 most recently added products.
     *
     * @return list of the 10 newest Product entities
     */
    List<Product> recentlyAddedProduct();
}