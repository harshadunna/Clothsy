package org.harsha.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
import org.harsha.backend.model.Size;
import org.harsha.backend.repository.ProductRepository;
import org.harsha.backend.request.CreateProductRequest;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.CloudinaryService;
import org.harsha.backend.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;

    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> createProduct(
            @RequestPart("req") CreateProductRequest req,
            @RequestPart(value = "image", required = false) MultipartFile image) throws ProductException {
        try {
            if (image != null && !image.isEmpty()) {
                String uploadedUrl = cloudinaryService.uploadImage(image);
                req.setImageUrl(uploadedUrl);
            }
            Product product = productService.createProduct(req);
            return new ResponseEntity<>(product, HttpStatus.CREATED);
        } catch (IOException e) {
            throw new ProductException("Failed to upload image to Cloudinary: " + e.getMessage());
        }
    }

    @DeleteMapping("/{productId}/delete")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long productId) throws ProductException {
        productService.deleteProduct(productId);
        ApiResponse res = new ApiResponse("Product deleted successfully", true);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> findAllProducts() {
        List<Product> products = productService.findAllProducts();
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @PutMapping("/{productId}/update")
    public ResponseEntity<Product> updateProduct(@RequestBody Product req, @PathVariable Long productId) throws ProductException {
        Product product = productService.updateProduct(productId, req);
        return new ResponseEntity<>(product, HttpStatus.CREATED);
    }

    @PostMapping("/creates")
    public ResponseEntity<ApiResponse> createMultipleProducts(@RequestBody CreateProductRequest[] req) throws ProductException {
        for (CreateProductRequest product : req) {
            productService.createProduct(product);
        }
        ApiResponse res = new ApiResponse("Products created successfully", true);
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    // THE MIGRATION ENDPOINT
    @PostMapping("/migrate-legacy-images")
    public ResponseEntity<ApiResponse> migrateLegacyImages() {
        List<Product> products = productRepository.findAll();
        int updatedCount = 0;

        for (Product product : products) {
            boolean isUpdated = false;
            try {
                if (product.getImageUrl() != null && !product.getImageUrl().contains("cloudinary.com")) {
                    String newUrl = cloudinaryService.uploadFromUrl(product.getImageUrl());
                    product.setImageUrl(newUrl);
                    isUpdated = true;
                }
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    List<String> newImages = new ArrayList<>();
                    for (String oldUrl : product.getImages()) {
                        if (oldUrl != null && !oldUrl.contains("cloudinary.com")) {
                            newImages.add(cloudinaryService.uploadFromUrl(oldUrl));
                            isUpdated = true;
                        } else {
                            newImages.add(oldUrl);
                        }
                    }
                    product.setImages(newImages);
                }
                if (isUpdated) {
                    productRepository.save(product);
                    updatedCount++;
                    System.out.println("Migrated images for Product ID: " + product.getId());
                }
            } catch (Exception e) {
                System.out.println("Failed to migrate Product ID " + product.getId() + ": " + e.getMessage());
            }
        }
        return new ResponseEntity<>(new ApiResponse("Migrated " + updatedCount + " products to Cloudinary.", true), HttpStatus.OK);
    }

    // NEW: RESTORE ORIGINAL IMAGES FROM JSON SO MIGRATION CAN RESTART
    @PostMapping(value = "/restore-original-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> restoreOriginalImages(@RequestPart("file") MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootArray = mapper.readTree(file.getInputStream());
            int updatedCount = 0;

            for (JsonNode node : rootArray) {
                if (!node.has("id")) continue;

                Long productId = node.get("id").asLong();
                Optional<Product> optionalProduct = productRepository.findById(productId);

                if (optionalProduct.isPresent()) {
                    Product product = optionalProduct.get();

                    // Put original main image back
                    if (node.has("imageUrl")) {
                        product.setImageUrl(node.get("imageUrl").asText());
                    }

                    // Put original gallery images back
                    if (node.has("images") && node.get("images").isArray()) {
                        List<String> images = new ArrayList<>();
                        for (JsonNode imgNode : node.get("images")) {
                            images.add(imgNode.asText());
                        }
                        product.setImages(images);
                    }

                    productRepository.save(product);
                    updatedCount++;
                }
            }
            return new ResponseEntity<>(new ApiResponse("Successfully restored original image URLs from JSON for " + updatedCount + " products.", true), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ApiResponse("Failed to restore images: " + e.getMessage(), false), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/sync-sizes-from-json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> syncSizesFromJson(@RequestPart("file") MultipartFile file) {
        // Kept intact just in case you ever need it
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootArray = mapper.readTree(file.getInputStream());
            int updatedCount = 0;
            for (JsonNode node : rootArray) {
                if (!node.has("id")) continue;
                Long productId = node.get("id").asLong();
                JsonNode sizesArray = node.get("sizes");
                int totalQuantity = node.has("quantity") ? node.get("quantity").asInt() : 0;
                Optional<Product> optionalProduct = productRepository.findById(productId);
                if (optionalProduct.isPresent()) {
                    Product product = optionalProduct.get();
                    Set<Size> currentSizes = product.getSizes();
                    if (currentSizes == null) { currentSizes = new HashSet<>(); product.setSizes(currentSizes); }
                    currentSizes.clear();
                    if (sizesArray != null && sizesArray.isArray()) {
                        for (JsonNode sizeNode : sizesArray) {
                            Size size = new Size();
                            size.setName(sizeNode.get("name").asText());
                            size.setQuantity(sizeNode.get("quantity").asInt());
                            currentSizes.add(size);
                        }
                    }
                    product.setQuantity(totalQuantity);
                    productRepository.save(product);
                    updatedCount++;
                }
            }
            return new ResponseEntity<>(new ApiResponse("Successfully restored EXACT sizes from JSON for " + updatedCount + " products.", true), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse("Failed to sync sizes: " + e.getMessage(), false), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/sync-images-from-json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> syncImagesFromJson(@RequestPart("file") MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootArray = mapper.readTree(file.getInputStream());
            int updatedCount = 0;

            for (JsonNode node : rootArray) {
                if (!node.has("id")) continue;
                Long productId = node.get("id").asLong();
                Optional<Product> optionalProduct = productRepository.findById(productId);

                if (optionalProduct.isPresent()) {
                    Product product = optionalProduct.get();
                    boolean modified = false;

                    // Update main image ONLY if it is a new Cloudinary link
                    if (node.has("imageUrl") && node.get("imageUrl").asText().contains("cloudinary.com")) {
                        product.setImageUrl(node.get("imageUrl").asText());
                        modified = true;
                    }

                    // Update gallery images
                    if (node.has("images") && node.get("images").isArray()) {
                        List<String> newImages = new java.util.ArrayList<>();
                        for (JsonNode imgNode : node.get("images")) {
                            newImages.add(imgNode.asText());
                        }
                        product.setImages(newImages);
                        modified = true;
                    }

                    if (modified) {
                        productRepository.save(product); // Safe save, sizes are ignored
                        updatedCount++;
                    }
                }
            }
            return new ResponseEntity<>(new ApiResponse("Successfully synced Cloudinary images for " + updatedCount + " products.", true), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ApiResponse("Failed to sync images: " + e.getMessage(), false), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/force-cloudinary-sweep")
    public ResponseEntity<ApiResponse> forceCloudinarySweep() {
        // Fetch all products directly from the repository
        List<Product> products = productRepository.findAll();

        int completelyFixed = 0;
        int skippedBecauseAlreadyPerfect = 0;
        int failedDownloads = 0;

        for (Product product : products) {
            boolean requiresDatabaseUpdate = false;

            try {
                // 1. SWEEP THE MAIN IMAGE
                String mainImg = product.getImageUrl();
                if (mainImg != null && !mainImg.contains("cloudinary.com")) {
                    System.out.println("Catching legacy main image on Product ID: " + product.getId());
                    String secureUrl = cloudinaryService.uploadFromUrl(mainImg);
                    product.setImageUrl(secureUrl);
                    requiresDatabaseUpdate = true;
                }

                // 2. SWEEP THE GALLERY IMAGES
                if (product.getImages() != null && !product.getImages().isEmpty()) {
                    List<String> sweptGallery = new ArrayList<>();

                    for (String galleryImg : product.getImages()) {
                        if (galleryImg != null && !galleryImg.contains("cloudinary.com")) {
                            System.out.println("Catching legacy gallery image on Product ID: " + product.getId());
                            try {
                                String secureUrl = cloudinaryService.uploadFromUrl(galleryImg);
                                sweptGallery.add(secureUrl);
                                requiresDatabaseUpdate = true;
                            } catch (Exception e) {
                                System.err.println("Failed to upload a gallery image for Product " + product.getId() + ": " + e.getMessage());
                                sweptGallery.add(galleryImg); // Keep the old one so it isn't deleted
                                failedDownloads++;
                            }
                        } else {
                            sweptGallery.add(galleryImg); // It's already Cloudinary, keep it safe
                        }
                    }
                    // Only overwrite the list if we actually found and fixed something
                    if (requiresDatabaseUpdate) {
                        product.setImages(sweptGallery);
                    }
                }

                // 3. SAFE SAVE (Only if a change was made)
                if (requiresDatabaseUpdate) {
                    productRepository.save(product);
                    completelyFixed++;
                } else {
                    skippedBecauseAlreadyPerfect++;
                }

            } catch (Exception e) {
                System.err.println("Fatal error processing Product ID " + product.getId() + ": " + e.getMessage());
                failedDownloads++;
            }
        }

        String msg = String.format("Sweep Complete! Fixed %d products. Skipped %d perfect products. Failed to download %d strict images.",
                completelyFixed, skippedBecauseAlreadyPerfect, failedDownloads);

        return new ResponseEntity<>(new ApiResponse(msg, true), HttpStatus.OK);
    }
}