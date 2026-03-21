package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.model.OrderItem;
import org.harsha.backend.repository.OrderItemRepository;
import org.springframework.stereotype.Service;

/**
 * OrderItemServiceImplementation
 *
 * Concrete implementation of {@link OrderItemService}.
 * Handles persistence of individual order items
 * during the order creation process.
 */
@Service
@RequiredArgsConstructor
public class OrderItemServiceImplementation implements OrderItemService {

    private final OrderItemRepository orderItemRepository;

    /**
     * Persists a new order item to the database.
     *
     * @param orderItem the OrderItem to save
     * @return the saved OrderItem entity with generated ID
     */
    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }
}