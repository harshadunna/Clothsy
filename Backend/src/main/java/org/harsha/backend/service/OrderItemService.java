package org.harsha.backend.service;

import org.harsha.backend.model.OrderItem;

/**
 * OrderItemService Interface
 *
 * Defines the contract for order item related business operations.
 * Implementations handle the actual logic for persisting
 * individual items within an order.
 */
public interface OrderItemService {

    /**
     * Creates and persists a new order item.
     * Called during order creation to save each product line.
     *
     * @param orderItem the OrderItem to persist
     * @return the saved OrderItem entity
     */
    OrderItem createOrderItem(OrderItem orderItem);
}