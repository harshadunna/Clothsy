package org.harsha.backend.repository;

import org.harsha.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * OrderRepository
 *
 * Data access layer for the Order entity.
 * Extends JpaRepository to inherit standard CRUD operations
 * out of the box.
 *
 * Provides custom queries for retrieving orders by user
 * and fetching all orders sorted by creation date.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Retrieves all active orders for a specific user.
     * Filters by order statuses that represent an ongoing order lifecycle
     * (PLACED, CONFIRMED, SHIPPED, DELIVERED).
     *
     * @param userId the ID of the user whose orders to retrieve
     * @return list of active orders belonging to the user
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId " +
            "AND (o.orderStatus = 'PLACED' " +
            "OR o.orderStatus = 'CONFIRMED' " +
            "OR o.orderStatus = 'SHIPPED' " +
            "OR o.orderStatus = 'DELIVERED')")
    List<Order> getUsersOrders(@Param("userId") Long userId);

    /**
     * Retrieves all orders in the system sorted by creation date (newest first).
     * Typically used for admin order management views.
     *
     * @return list of all orders ordered by createdAt descending
     */
    List<Order> findAllByOrderByCreatedAtDesc();
}