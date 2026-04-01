package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.Category;
import org.harsha.backend.model.Promotion;
import org.harsha.backend.repository.CategoryRepository;
import org.harsha.backend.repository.PromotionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionRepository promotionRepository;
    private final CategoryRepository categoryRepository;

    @PostMapping("/")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion, @RequestParam Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        promotion.setTargetCategory(category);
        Promotion savedPromo = promotionRepository.save(promotion);
        return ResponseEntity.ok(savedPromo);
    }

    @GetMapping("/")
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    @DeleteMapping("/{promoId}")
    public ResponseEntity<String> deletePromotion(@PathVariable Long promoId) {
        promotionRepository.deleteById(promoId);
        return ResponseEntity.ok("Promotion deleted successfully");
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}