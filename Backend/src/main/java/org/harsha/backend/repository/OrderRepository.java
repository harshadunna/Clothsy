/**
 * This repository interface handles all database operations for the Order entity using Spring Data JPA. It includes custom JPQL queries with JOIN FETCH to prevent N+1 performance issues when retrieving orders alongside their associated items and users. Additionally, it provides highly optimized aggregation queries and status-based filters specifically designed to support the admin analytics dashboard without loading excessive records into server memory.
 */
package org.harsha.backend.repository;

import org.harsha.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.user.id = :userId " +
       "AND o.orderStatus IN ('PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', " +
       "'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_PICKED', " +
       "'RETURN_RECEIVED', 'REFUND_INITIATED', 'REFUND_COMPLETED')")
    List<Order> getUsersOrders(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.product WHERE o.id = :orderId")
    Optional<Order> findOrderById(@Param("orderId") Long orderId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems JOIN FETCH o.user ORDER BY o.createdAt DESC")
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.orderStatus IN ('SHIPPED', 'OUT_FOR_DELIVERY', 'RETURN_REQUESTED', 'RETURN_PICKED', 'RETURN_RECEIVED', 'REFUND_INITIATED')")
    List<Order> findActiveOrdersForTracking();

    @Query("SELECT COALESCE(SUM(o.totalDiscountedPrice), 0) FROM Order o WHERE o.orderStatus NOT IN ('CANCELLED', 'REFUND_COMPLETED')")
    Long calculateTotalActiveRevenue();

    List<Order> findTop5ByOrderStatusInOrderByCreatedAtDesc(List<String> statuses);

    @Query("SELECT o FROM Order o WHERE o.orderStatus != 'CANCELLED'")
    List<Order> findAllValidOrders();
}