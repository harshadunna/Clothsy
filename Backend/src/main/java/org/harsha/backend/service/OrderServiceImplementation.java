package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.*;
import org.harsha.backend.repository.AddressRepository;
import org.harsha.backend.repository.OrderItemRepository;
import org.harsha.backend.repository.OrderRepository;
import org.harsha.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * OrderServiceImplementation
 *
 * Concrete implementation of {@link OrderService}.
 * Handles the full order lifecycle — from creating an order
 * from cart contents, through status transitions, to deletion.
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImplementation implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderItemService orderItemService;
    private final OrderItemRepository orderItemRepository;

    /**
     * Creates a new order by converting the user's current cart into order items.
     *
     * Flow:
     * 1. Save the shipping address and link it to the user
     * 2. Fetch the user's cart and convert each CartItem into an OrderItem
     * 3. Build the Order with totals from the cart
     * 4. Save the order and link each OrderItem back to it
     */
    @Override
    public Order createOrder(User user, Address shippingAddress) {

        // Save shipping address and associate it with the user
        shippingAddress.setUser(user);
        Address savedAddress = addressRepository.save(shippingAddress);
        user.getAddresses().add(savedAddress);
        userRepository.save(user);

        // Fetch the user's current cart with recalculated totals
        Cart cart = cartService.findUserCart(user.getId());
        List<OrderItem> orderItems = new ArrayList<>();

        // Convert each cart item into an order item snapshot
        for (CartItem item : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setPrice(item.getPrice());
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSize(item.getSize());
            orderItem.setUserId(item.getUserId());
            orderItem.setDiscountedPrice(item.getDiscountedPrice());

            orderItems.add(orderItemRepository.save(orderItem));
        }

        // Build the order with cart totals and initial status
        Order order = new Order();
        order.setUser(user);
        order.setOrderItems(orderItems);
        order.setTotalPrice(cart.getTotalPrice());
        order.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        order.setDiscount(cart.getDiscount());
        order.setTotalItem(cart.getTotalItem());
        order.setShippingAddress(savedAddress);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("PENDING");
        order.getPaymentDetails().setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Link each order item back to the saved order
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        return savedOrder;
    }

/**
 *