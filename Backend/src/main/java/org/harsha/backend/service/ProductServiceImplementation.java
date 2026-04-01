package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Category;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Size;
import org.harsha.backend.repository.CategoryRepository;
import org.harsha.backend.repository.OrderItemRepository;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.request.CreateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImplementation implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;

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
            secondLevel = categoryRepository.findByNameAndParent(req.getSecondLevelCategory(), topLevel.getName());
        } catch (Exception e) { secondLevel = null; }
        
        if (secondLevel == null) {
            Category newSecondLevel = new Category();
            newSecondLevel.setName(req.getSecondLevelCategory());
            newSecondLevel.setParentCategory(topLevel);
            newSecondLevel.setLevel(2);
            secondLevel = categoryRepository.save(newSecondLevel);
        }

        Category thirdLevel = null;
        try {
            thirdLevel = categoryRepository.findByNameAndParent(req.getThirdLevelCategory(), secondLevel.getName());
        } catch (Exception e) { thirdLevel = null; }
        
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
        product.setMaterials(req.getMaterials());
        product.setFit(req.getFit());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setImageUrl(req.getImageUrl());
        product.setBrand(req.getBrand());
        product.setPrice(req.getPrice());
        product.setSizes(sizes);
        product.setQuantity(req.getQuantity());
        product.setCategory(thirdLevel);
        product.setCreatedAt(LocalDateTime.now());

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

        if (req.getTitle() != null) product.setTitle(req.getTitle());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getMaterials() != null) product.setMaterials(req.getMaterials());
        if (req.getFit() != null) product.setFit(req.getFit());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getColor() != null) product.setColor(req.getColor());
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());

        product.setPrice(req.getPrice());
        product.setDiscountedPrice(req.getDiscountedPrice());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setQuantity(req.getQuantity());

        if (req.getSizes() != null) {
            product.getSizes().clear();
            product.getSizes().addAll(req.getSizes());
        }

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
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductException("Product not found with id: " + id));
    }

    @Override
    public List<Product> findProductByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    @Override
    public List<Product> searchProduct(String query) {
        List<Product> allProducts = productRepository.findAll();
        if (query == null || query.trim().isEmpty()) {
            return allProducts;
        }

        List<String> stopWords = Arrays.asList("the", "a", "an", "and", "or", "for", "in", "on", "with", "of", "to");
        List<String> keywords = Arrays.stream(query.toLowerCase().split("\\s+"))
                .filter(word -> !stopWords.contains(word))
                .collect(Collectors.toList());

        return allProducts.stream()
                .filter(p -> {
                    String searchableText = buildSearchableText(p);
                    for (String keyword : keywords) {
                        if (!isFuzzyMatch(searchableText, keyword)) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<Product> getAllProduct(
            String category, List<String> colors, List<String> sizes,
            Integer minPrice, Integer maxPrice, Integer minDiscount,
            String sort, String stock, Integer pageNumber, Integer pageSize, String search) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        List<Product> products = productRepository.filterProducts(category, minPrice, maxPrice, minDiscount, sort);

        if (colors != null && !colors.isEmpty() && !(colors.size() == 1 && colors.get(0).isEmpty())) {
            products = products.stream()
                    .filter(p -> colors.stream().anyMatch(c -> c.equalsIgnoreCase(p.getColor())))
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
                products = products.stream().filter(p -> p.getQuantity() > 0).collect(Collectors.toList());
            } else if (stock.equals("out_of_stock")) {
                products = products.stream().filter(p -> p.getQuantity() < 1).collect(Collectors.toList());
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            List<String> stopWords = Arrays.asList("the", "a", "an", "and", "or", "for", "in", "on", "with", "of", "to");
            List<String> keywords = Arrays.stream(search.toLowerCase().split("\\s+"))
                    .filter(word -> !stopWords.contains(word))
                    .collect(Collectors.toList());

            products = products.stream()
                    .filter(p -> {
                        String searchableText = buildSearchableText(p);
                        for (String keyword : keywords) {
                            if (!isFuzzyMatch(searchableText, keyword)) {
                                return false;
                            }
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        int startIndex = (int) pageable.getOffset();
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

    @Override
    public List<Product> getRecommendedProducts(Long productId) {
        return orderItemRepository.findFrequentlyBoughtTogether(productId, PageRequest.of(0, 4));
    }


    // GENDER-SEPARATED CLOTHSY AI PAIRING LOGIC 
    @Override
    public List<Product> getRecommendations(Long productId) throws ProductException {
        Product product = findProductById(productId);

        Category cat = product.getCategory();
        String genderRoot = resolveGenderRoot(cat); // Resolves to either "collections" or "atelier"
        String leafSlug = cat != null ? cat.getName().toLowerCase() : "";

        List<String> targetCategories;

        // SEPARATE MAPS BASED ON GENDER ROOT
        if ("atelier".equalsIgnoreCase(genderRoot)) {
            // MENSWEAR MAPPING (Atelier)
            Map<String, List<String>> mensPairings = new HashMap<>();
            
            List<String> mensTops = Arrays.asList("trousers", "raw-denim", "suits", "briefcases", "watches", "boots");
            mensPairings.put("poplin-shirts", mensTops);
            mensPairings.put("fine-knits", mensTops);

            List<String> mensBottoms = Arrays.asList("poplin-shirts", "fine-knits", "overcoats", "boots", "belts");
            mensPairings.put("trousers", mensBottoms);
            mensPairings.put("raw-denim", mensBottoms);

            List<String> mensOuter = Arrays.asList("poplin-shirts", "trousers", "raw-denim", "suits", "briefcases");
            mensPairings.put("overcoats", mensOuter);
            mensPairings.put("suits", Arrays.asList("poplin-shirts", "overcoats", "watches", "briefcases", "boots"));

            List<String> mensAcc = Arrays.asList("suits", "poplin-shirts", "trousers", "raw-denim", "overcoats");
            mensPairings.put("briefcases", mensAcc);
            mensPairings.put("boots", mensAcc);
            mensPairings.put("watches", mensAcc);
            mensPairings.put("belts", mensAcc);

            targetCategories = new ArrayList<>(mensPairings.getOrDefault(leafSlug, 
                               Arrays.asList("trousers", "poplin-shirts", "boots", "watches", "suits")));
        } else {
            // WOMENSWEAR MAPPING (Collections)
            Map<String, List<String>> womensPairings = new HashMap<>();

            List<String> womensTops = Arrays.asList("womens-trousers", "outerwear", "bags", "jewelry", "footwear");
            womensPairings.put("blouses", womensTops);
            womensPairings.put("knits", womensTops);
            womensPairings.put("jumpers", womensTops);

            List<String> womensBottoms = Arrays.asList("blouses", "knits", "jumpers", "outerwear", "footwear", "bags");
            womensPairings.put("womens-trousers", womensBottoms);

            List<String> womensDresses = Arrays.asList("jewelry", "bags", "scarves", "footwear", "outerwear");
            womensPairings.put("silk-dresses", womensDresses);
            womensPairings.put("evening-dresses", womensDresses);

            womensPairings.put("outerwear", Arrays.asList("blouses", "womens-trousers", "knits", "silk-dresses", "bags", "eyewear"));

            List<String> womensAcc = Arrays.asList("silk-dresses", "evening-dresses", "womens-trousers", "blouses", "outerwear");
            womensPairings.put("bags", womensAcc);
            womensPairings.put("footwear", womensAcc);
            womensPairings.put("jewelry", womensAcc);
            womensPairings.put("scarves", womensAcc);
            womensPairings.put("eyewear", womensAcc);

            targetCategories = new ArrayList<>(womensPairings.getOrDefault(leafSlug, 
                               Arrays.asList("womens-trousers", "blouses", "footwear", "bags", "silk-dresses")));
        }

        // SHUFFLE CATEGORIES to keep it fresh
        Collections.shuffle(targetCategories);

        List<Product> results = new ArrayList<>();
        Set<Long> seenIds = new HashSet<>();
        seenIds.add(product.getId()); 

        for (String targetSlug : targetCategories) {
            if (results.size() >= 4) break;

            // Fetch a pool of items that strictly match BOTH gender and category
            List<Product> found = productRepository.findTopByGenderAndCategory(genderRoot, targetSlug, PageRequest.of(0, 15));

            if (!found.isEmpty()) {
                // Shuffle pool to pick a random one
                List<Product> modifiableFound = new ArrayList<>(found);
                Collections.shuffle(modifiableFound);

                for (Product p : modifiableFound) {
                    if (!seenIds.contains(p.getId())) {
                        results.add(p);
                        seenIds.add(p.getId());
                        break; 
                    }
                }
            }
        }

        // Guaranteed Grid Fill (Strictly within the same gender root)
        if (results.size() < 4) {
            List<Product> fillIns = productRepository.findRecentByGenderExcludingCategory(genderRoot, leafSlug, PageRequest.of(0, 20));
            
            List<Product> modifiableFillIns = new ArrayList<>(fillIns);
            Collections.shuffle(modifiableFillIns);

            for (Product p : modifiableFillIns) {
                if (results.size() >= 4) break;
                if (!seenIds.contains(p.getId())) {
                    results.add(p);
                    seenIds.add(p.getId());
                }
            }
        }

        return results;
    }

    private String resolveGenderRoot(Category category) {
        if (category == null) return "collections";
        if (category.getParentCategory() == null) {
            return category.getName().toLowerCase();
        }
        return resolveGenderRoot(category.getParentCategory());
    }

    private String buildSearchableText(Product p) {
        return (
                (p.getTitle() != null ? p.getTitle() : "") + " " +
                        (p.getDescription() != null ? p.getDescription() : "") + " " +
                        (p.getBrand() != null ? p.getBrand() : "") + " " +
                        (p.getColor() != null ? p.getColor() : "") + " " +
                        (p.getCategory() != null ? p.getCategory().getName() : "")
        ).toLowerCase();
    }

    private boolean isFuzzyMatch(String searchableText, String keyword) {
        if (searchableText.contains(keyword)) {
            return true;
        }

        int maxAllowedDistance = keyword.length() <= 3 ? 0 : (keyword.length() <= 6 ? 1 : 2);

        if (maxAllowedDistance == 0) {
            return false;
        }

        String[] textWords = searchableText.split("\\s+");
        for (String word : textWords) {
            if (Math.abs(word.length() - keyword.length()) <= maxAllowedDistance) {
                int distance = calculateLevenshteinDistance(word, keyword);
                if (distance <= maxAllowedDistance) {
                    return true;
                }
            }
        }
        return false;
    }

    private int calculateLevenshteinDistance(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];

        for (int i = 0; i <= a.length(); i++) {
            for (int j = 0; j <= b.length(); j++) {
                if (i == 0) {
                    dp[i][j] = j;
                } else if (j == 0) {
                    dp[i][j] = i;
                } else {
                    int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;
                    dp[i][j] = Math.min(
                            Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                            dp[i - 1][j - 1] + cost
                    );
                }
            }
        }
        return dp[a.length()][b.length()];
    }
}