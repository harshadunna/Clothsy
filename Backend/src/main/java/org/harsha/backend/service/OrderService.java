package org.harsha.backend.service;

import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.User;

import java.util.List;

/**
 * OrderService Interface
 *
 * Defines the contract for all order-related business operations.
 * Covers the full order lifecycle from creation through delivery or cancellation.
 */
public interface OrderService {

    /**
     * Creates a new order from the user's current cart contents.
     * Accepts an addressId to look up an existing saved address.
     *
     * @param user      the user placing the order
     * @param addressId ID of the existing address to ship to
     * @return the newly created Order entity
     */
    Order createOrder(User user, Long addressId);

    /**
     * Finds an order by its unique ID.
     */
    Order findOrderById(Long orderId) throws OrderException;

    /**
     * Retrieves the full order history for a specific user.
     */
    List<Order> usersOrderHistory(Long userId);

    /**
     * Marks an order as PLACED and updates payment status to COMPLETED.
     */
    Order placedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as CONFIRMED by the admin.
     */
    Order confirmedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as SHIPPED.
     */
    Order shippedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as DELIVERED.
     */
    Order deliveredOrder(Long orderId) throws OrderException;

    /**
     * Marks an entire order as CANCELLED.
     */
    Order cancledOrder(Long orderId) throws OrderException;

    /**
     * Retrieves all orders sorted by creation date descending.
     */
    List<Order> getAllOrders();

    /**
     * Permanently deletes an order from the system.
     */
    void deleteOrder(Long orderId) throws OrderException;

    /**
     * Partially (or fully) cancels specific items within an order and recalculates totals.
     * * @param orderId The ID of the order
     * @param itemIdsToCancel List of OrderItem IDs to cancel
     * @return The recalculated Order
     */
    Order cancelOrderItems(Long orderId, List<Long> itemIdsToCancel) throws OrderException;
}