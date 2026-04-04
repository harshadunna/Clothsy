package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.ProductException;
import org.harsha.backend.model.Product;
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
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;
    private final CloudinaryService cloudinaryService;

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
}