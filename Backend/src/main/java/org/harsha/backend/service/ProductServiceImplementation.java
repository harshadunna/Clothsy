package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Category;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Size;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImplementation implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public Product createProduct(CreateProductRequest req) throws ProductException {

        // ── Resolve or create Top Level Category (e.g. "Men") ──────────────
        Category topLevel = categoryRepository.findByName(req.getTopLevelCategory());
        if (topLevel == null) {
            Category newTopLevel = new Category();
            newTopLevel.setName(req.getTopLevelCategory());
            newTopLevel.setLevel(1);
            topLevel = categoryRepository.save(newTopLevel);
        }

        // ── Resolve or create Second Level Category (e.g. "Clothing") ──────
        Category secondLevel = null;
        try {
            secondLevel = categoryRepository.findByNameAndParent(
                    req.getSecondLevelCategory(), topLevel.getName()
            );
        } catch (Exception e) {
            secondLevel = null;
        }
        if (secondLevel == null) {
            Category newSecondLevel = new Category();
            newSecondLevel.setName(req.getSecondLevelCategory());
            newSecondLevel.setParentCategory(topLevel);
            newSecondLevel.setLevel(2);
            secondLevel = categoryRepository.save(newSecondLevel);
        }

        // ── Resolve or create Third Level Category (e.g. "mens_kurta") ─────
        Category thirdLevel = null;
        try {
            thirdLevel = categoryRepository.findByNameAndParent(
                    req.getThirdLevelCategory(), secondLevel.getName()
            );
        } catch (Exception e) {
            thirdLevel = null;
        }
        if (thirdLevel == null) {
            Category newThirdLevel = new Category();
            newThirdLevel.setName(req.getThirdLevelCategory());
            newThirdLevel.setParentCategory(secondLevel);
            newThirdLevel.setLevel(3);
            thirdLevel = categoryRepository.save(newThirdLevel);
        }

        Set<Size> sizes = req.getSizes();

        // ── Build and persist the Product entity ────────────────────────────
        Product product = new Product();
        product.setTitle(req.getTitle());
        product.setColor(req.getColor());
        product.setDescription(req.getDescription());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setImageUrl(req.getImageUrl());
        product.setBrand(req.getBrand());
        product.setPrice(req.getPrice());
        product.setSizes(sizes);
        product.setQuantity(req.getQuantity());
        product.setCategory(thirdLevel);
        product.setCreatedAt(LocalDateTime.now());

        // ── Set multiple images if provided ─────────────────────────────────
        if (req.getImages() != null && !req.getImages().isEmpty()) {
            product.setImages(req.getImages());
        }

        return productRepository.save(product);
    }

    @Override
    public String deleteProduct(Long productId) throws ProductException {
        Product product = findProductById(productId);
        product.getSizes().clear();
        productRepository.delete(product);
        return "Product deleted successfully";
    }

    @Override
    public Product updateProduct(Long productId, Product req) throws ProductException {
        Product product = findProductById(productId);

        // ── Update Text Fields ─────────────────────────────────────────────
        if (req.getTitle() != null) product.setTitle(req.getTitle());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getColor() != null) product.setColor(req.getColor());
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());

        // ── Update Pricing & Inventory (Now safely allows 0 for Out of Stock) ──
        product.setPrice(req.getPrice());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setQuantity(req.getQuantity());

        // ── Update Sizes ───────────────────────────────────────────────────
        if (req.getSizes() != null) {
            product.getSizes().clear();
            product.getSizes().addAll(req.getSizes());
        }

        // ── Update Multiple Images ─────────────────────────────────────────
        if (req.getImages() != null) {
            product.getImages().clear();
            product.getImages().addAll(req.getImages());
        }

        return productRepository.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product findProductById(Long id) throws ProductException {
        Optional<Product> opt = productRepository.findById(id);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new ProductException("Product not found with id: " + id);
    }

    @Override
    public List<Product> findProductByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Override
    public List<Product> searchProduct(String query) {
        return productRepository.searchProduct(query);
    }

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
            Integer pageSize,
            String search) { // ── NEW: Added search parameter ──

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        // ── Fetch base filtered list from repository ──────────────────────────
        List<Product> products = productRepository.filterProducts(
                category, minPrice, maxPrice, minDiscount, sort
        );

        // ── Apply color filter ────────────────────────────────────────────────
        if (colors != null && !colors.isEmpty() && !(colors.size() == 1 && colors.get(0).isEmpty())) {
            products = products.stream()
                    .filter(p -> colors.stream()
                            .anyMatch(c -> c.equalsIgnoreCase(p.getColor())))
                    .collect(Collectors.toList());
        }

        // ── Apply size filter ─────────────────────────────────────────────────
        if (sizes != null && !sizes.isEmpty() && !(sizes.size() == 1 && sizes.get(0).isEmpty())) {
            products = products.stream()
                    .filter(p -> p.getSizes().stream()
                            .anyMatch(s -> sizes.stream().anyMatch(size -> size.equalsIgnoreCase(s.getName()))))
                    .collect(Collectors.toList());
        }

        // ── Apply stock filter ────────────────────────────────────────────────
        if (stock != null && !stock.isEmpty()) {
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

        // ── NEW: Apply Global Search Keyword ──────────────────────────────────
        if (search != null && !search.isEmpty()) {
            String q = search.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(q) ||
                            (p.getBrand() != null && p.getBrand().toLowerCase().contains(q)) ||
                            (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // ── SAFE Pagination (Prevents 500 Internal Server Errors) ─────────────
        int startIndex = (int) pageable.getOffset();

        // If the calculated start index is beyond our list size, return an empty page
        if (startIndex >= products.size()) {
            return new PageImpl<>(List.of(), pageable, products.size());
        }

        int endIndex = Math.min(startIndex + pageable.getPageSize(), products.size());
        List<Product> pageContent = products.subList(startIndex, endIndex);

        return new PageImpl<>(pageContent, pageable, products.size());
    }

    @Override
    public List<Product> recentlyAddedProduct() {
        return productRepository.findTop10ByOrderByCreatedAtDesc();
    }
}