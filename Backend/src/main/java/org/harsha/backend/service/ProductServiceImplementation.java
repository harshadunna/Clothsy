package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Category;
import org.harsha.backend.model.Product;
import org.harsha.backend.repository.CategoryRepository;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.request.CreateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ProductServiceImplementation
 *
 * Concrete implementation of {@link ProductService}.
 * Handles all product business logic including category hierarchy
 * management, filtering, pagination, and CRUD operations.
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImplementation implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Creates a new product and builds up to 3 levels of category hierarchy.
     * Each level is created only if it doesn't already exist in the database.
     */
    @Override
    public Product createProduct(CreateProductRequest req) throws ProductException {

        // Resolve or create top-level category (e.g. "Men", "Women")
        Category topLevel = categoryRepository.findByName(req.getTopLevelCategory());
        if (topLevel == null) {
            Category newTopLevel = new Category();
            newTopLevel.setName(req.getTopLevelCategory());
            newTopLevel.setLevel(1);
            topLevel = categoryRepository.save(newTopLevel);
        }

        // Resolve or create second-level category (e.g. "Clothing", "Footwear")
        Category secondLevel = categoryRepository.findByNameAndParent(
                req.getSecondLevelCategory(), topLevel.getName()
        );
        if (secondLevel == null) {
            Category newSecondLevel = new Category();
            newSecondLevel.setName(req.getSecondLevelCategory());
            newSecondLevel.setParentCategory(topLevel);
            newSecondLevel.setLevel(2);
            secondLevel = categoryRepository.save(newSecondLevel);
        }

        // Resolve or create third-level category (e.g. "T-Shirts", "Sneakers")
        Category thirdLevel = categoryRepository.findByNameAndParent(
                req.getThirdLevelCategory(), secondLevel.getName()
        );
        if (thirdLevel == null) {
            Category newThirdLevel = new Category();
            newThirdLevel.setName(req.getThirdLevelCategory());
            newThirdLevel.setParentCategory(secondLevel);
            newThirdLevel.setLevel(3);
            thirdLevel = categoryRepository.save(newThirdLevel);
        }

        // Build and persist the new product linked to the third-level category
        Product product = new Product();
        product.setTitle(req.getTitle());
        product.setColor(req.getColor());
        product.setDescription(req.getDescription());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setImageUrl(req.getImageUrl());
        product.setBrand(req.getBrand());
        product.setPrice(req.getPrice());
        product.setSizes(req.getSizes());
        product.setQuantity(req.getQuantity());
        product.setCategory(thirdLevel);
        product.setCreatedAt(LocalDateTime.now());

        return productRepository.save(product);
    }

    /**
     * Deletes a product after clearing its sizes collection to avoid
     * orphaned records in the element collection table.
     */
    @Override
    public String deleteProduct(Long productId) throws ProductException {

        Product product = findProductById(productId);
        product.getSizes().clear();
        productRepository.delete(product);

        return "Product deleted successfully";
    }

    /**
     * Updates a product's quantity and description if provided in the request.
     * Only non-null / non-zero fields are updated — others are left unchanged.
     */
    @Override
    public Product updateProduct(Long productId, Product req) throws ProductException {

        Product product = findProductById(productId);

        if (req.getQuantity() != 0) {
            product.setQuantity(req.getQuantity());
        }
        if (req.getDescription() != null) {
            product.setDescription(req.getDescription());
        }

        return productRepository.save(product);
    }

    /**
     * Returns all products in the database.
     */
    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Finds a product by ID or throws ProductException if not found.
     */
    @Override
    public Product findProductById(Long id) throws ProductException {

        Optional<Product> opt = productRepository.findById(id);

        if (opt.isPresent()) {
            return opt.get();
        }

        throw new ProductException("Product not found with id: " + id);
    }

    /**
     * Returns all products in a given category (case-insensitive).
     */
    @Override
    public List<Product> findProductByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    /**
     * Searches products by keyword across title, description, brand, and category.
     */
    @Override
    public List<Product> searchProduct(String query) {
        return productRepository.searchProduct(query);
    }

    /**
     * Filters, sorts, and paginates products based on the provided criteria.
     *
     * Color and stock filters are applied in-memory after the database query
     * since they are not part of the JPQL filter query.
     */
    @Override
    public Page<Product> getAllProduct(
            String category,
            List<String> colors,
            List<String> sizes,
            Integer minPrice,
            Integer maxPrice,
            Integer minDiscount,
            String sort,
            String stock,
            Integer pageNumber,
            Integer pageSize) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        // Fetch base filtered list from the database
        List<Product> products = productRepository.filterProducts(
                category, minPrice, maxPrice, minDiscount, sort
        );

        // Apply in-memory color filter if colors are specified
        if (!colors.isEmpty()) {
            products = products.stream()
                    .filter(p -> colors.stream()
                            .anyMatch(c -> c.equalsIgnoreCase(p.getColor())))
                    .collect(Collectors.toList());
        }

        // Apply in-memory stock availability filter if specified
        if (stock != null) {
            if (stock.equals("in_stock")) {
                products = products.stream()
                        .filter(p -> p.getQuantity() > 0)
                        .collect(Collectors.toList());
            } else if (stock.equals("out_of_stock")) {
                products = products.stream()
                        .filter(p -> p.getQuantity() < 1)
                        .collect(Collectors.toList());
            }
        }

        // Manually slice the filtered list into a Page
        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), products.size());
        List<Product> pageContent = products.subList(startIndex, endIndex);

        return new PageImpl<>(pageContent, pageable, products.size());
    }

    /**
     * Returns the 10 most recently added products.
     */
    @Override
    public List<Product> recentlyAddedProduct() {
        return productRepository.findTop10ByOrderByCreatedAtDesc();
    }
}