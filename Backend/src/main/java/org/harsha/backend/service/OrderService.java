package org.harsha.backend.service;

import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.Address;
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
     *
     * @param user            the user placing the order
     * @param shippingAddress the delivery address for the order
     * @return the newly created Order entity
     */
    Order createOrder(User user, Address shippingAddress);

    /**
     * Finds an order by its unique ID.
     *
     * @param orderId ID of the order to retrieve
     * @return the matching Order entity
     * @throws OrderException if no order exists with the given ID
     */
    Order findOrderById(Long orderId) throws OrderException;

    /**
     * Retrieves the full order history for a specific user.
     *
     * @param userId ID of the user whose orders to retrieve
     * @return list of orders placed by the user
     */
    List<Order> usersOrderHistory(Long userId);

    /**
     * Marks an order as PLACED and updates payment status to COMPLETED.
     *
     * @param orderId ID of the order to place
     * @return the updated Order entity
     * @throws OrderException if the order is not found
     */
    Order placedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as CONFIRMED by the admin.
     *
     * @param orderId ID of the order to confirm
     * @return the updated Order entity
     * @throws OrderException if the order is not found
     */
    Order confirmedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as SHIPPED.
     *
     * @param orderId ID of the order to ship
     * @return the updated Order entity
     * @throws OrderException if the order is not found
     */
    Order shippedOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as DELIVERED.
     *
     * @param orderId ID of the order to deliver
     * @return the updated Order entity
     * @throws OrderException if the order is not found
     */
    Order deliveredOrder(Long orderId) throws OrderException;

    /**
     * Marks an order as CANCELLED.
     *
     * @param orderId ID of the order to cancel
     * @return the updated Order entity
     * @throws OrderException if the order is not found
     */
    Order cancledOrder(Long orderId) throws OrderException;

    /**
     * Retrieves all orders in the system sorted by creation date (newest first).
     * Intended for admin order management views.
     *
     * @return list of all orders
     */
    List<Order> getAllOrders();

    /**
     * Permanently deletes an order from the system.
     *
     * @param orderId ID of the order to delete
     * @throws OrderException if the order is not found
     */
    void deleteOrder(Long orderId) throws OrderException;
}