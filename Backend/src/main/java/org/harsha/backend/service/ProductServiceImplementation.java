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

        Category topLevel = categoryRepository.findByName(req.getTopLevelCategory());
        if (topLevel == null) {
            Category newTopLevel = new Category();
            newTopLevel.setName(req.getTopLevelCategory());
            newTopLevel.setLevel(1);
            topLevel = categoryRepository.save(newTopLevel);
        }

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
        if (req.getQuantity() != 0) {
            product.setQuantity(req.getQuantity());
        }
        if (req.getDescription() != null) {
            product.setDescription(req.getDescription());
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
            Integer pageSize) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize);

        List<Product> products = productRepository.filterProducts(
                category, minPrice, maxPrice, minDiscount, sort
        );

        if (colors != null && !colors.isEmpty() && !(colors.size() == 1 && colors.get(0).isEmpty())) {
            products = products.stream()
                    .filter(p -> colors.stream()
                            .anyMatch(c -> c.equalsIgnoreCase(p.getColor())))
                    .collect(Collectors.toList());
        }

        if (sizes != null && !sizes.isEmpty() && !(sizes.size() == 1 && sizes.get(0).isEmpty())) {
            products = products.stream()
                    .filter(p -> p.getSizes().stream()
                            .anyMatch(s -> sizes.stream().anyMatch(size -> size.equalsIgnoreCase(s.getName()))))
                    .collect(Collectors.toList());
        }

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

        int startIndex = (int) pageable.getOffset();
        int endIndex = Math.min(startIndex + pageable.getPageSize(), products.size());
        List<Product> pageContent = products.subList(startIndex, endIndex);

        return new PageImpl<>(pageContent, pageable, products.size());
    }

    @Override
    public List<Product> recentlyAddedProduct() {
        return productRepository.findTop10ByOrderByCreatedAtDesc();
    }
}