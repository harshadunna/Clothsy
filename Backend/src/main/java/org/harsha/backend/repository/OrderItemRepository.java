package org.harsha.backend.repository;

import org.harsha.backend.model.OrderItem;
import org.harsha.backend.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi2.product FROM OrderItem oi1 JOIN OrderItem oi2 ON oi1.order = oi2.order WHERE oi1.product.id = :productId AND oi2.product.id != :productId GROUP BY oi2.product ORDER BY COUNT(oi2) DESC")
    List<Product> findFrequentlyBoughtTogether(@Param("productId") Long productId, Pageable pageable);
}