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

    List<Order> findAllByOrderByCreatedAtDesc();
}