package org.harsha.backend.service;

import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.User;

import java.util.List;

public interface OrderService {

    Order createOrder(User user, Long addressId);

    Order findOrderById(Long orderId) throws OrderException;

    List<Order> usersOrderHistory(Long userId);

    Order placedOrder(Long orderId) throws OrderException;

    Order confirmedOrder(Long orderId) throws OrderException;

    Order shippedOrder(Long orderId) throws OrderException;

    Order deliveredOrder(Long orderId) throws OrderException;

    Order cancelOrder(Long orderId) throws OrderException;

    List<Order> getAllOrders();

    void deleteOrder(Long orderId) throws OrderException;

    Order cancelOrderItems(Long orderId, List<Long> itemIdsToCancel) throws OrderException;

    Order returnOrderItems(Long orderId, List<Long> itemIdsToReturn) throws OrderException;

    Order returnPickedOrder(Long orderId) throws OrderException;

    Order returnReceivedOrder(Long orderId) throws OrderException;

    Order refundInitiatedOrder(Long orderId) throws OrderException;

    Order refundCompletedOrder(Long orderId) throws OrderException;
}