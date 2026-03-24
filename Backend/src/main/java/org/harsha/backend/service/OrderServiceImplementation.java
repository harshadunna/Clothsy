package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.*;
import org.harsha.backend.repository.AddressRepository;
import org.harsha.backend.repository.OrderItemRepository;
import org.harsha.backend.repository.OrderRepository;
import org.harsha.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImplementation implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final OrderItemService orderItemService;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional // Keeps the database safe during complex saves
    public Order createOrder(User user, Long addressId) {

        // 1. Look up existing address — never create a new one here
        Address shippingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        // 2. Fetch the user's current cart
        Cart cart = cartService.findUserCart(user.getId());
        List<OrderItem> orderItems = new ArrayList<>();

        // 3. Convert each cart item into an order item snapshot
        for (CartItem item : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setPrice(item.getPrice());
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSize(item.getSize());
            orderItem.setUserId(item.getUserId());
            orderItem.setDiscountedPrice(item.getDiscountedPrice());
            orderItem.setItemStatus("PENDING"); // Initialize item status

            orderItems.add(orderItemRepository.save(orderItem));
        }

        // 4. Build the order with cart totals
        Order order = new Order();
        order.setUser(user);
        order.setOrderItems(orderItems);
        order.setTotalPrice(cart.getTotalPrice());
        order.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        order.setDiscount(cart.getDiscount());
        order.setTotalItem(cart.getTotalItem());
        order.setShippingAddress(shippingAddress);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("PENDING");
        order.getPaymentDetails().setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        // 5. Generate unique Order ID to prevent database crashes
        order.setOrderId(UUID.randomUUID().toString());

        // 6. Save the order
        Order savedOrder = orderRepository.save(order);

        // 7. Link each order item back to the saved order
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        return savedOrder;
    }

    @Override
    public Order placedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("PLACED");
        order.getPaymentDetails().setStatus("COMPLETED");
        return orderRepository.save(order);
    }

    @Override
    public Order confirmedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    @Override
    public Order shippedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("SHIPPED");
        return orderRepository.save(order);
    }

    @Override
    public Order deliveredOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("DELIVERED");
        return orderRepository.save(order);
    }

    @Override
    public Order cancledOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CANCELLED");
        return orderRepository.save(order);
    }

    @Override
    public Order findOrderById(Long orderId) throws OrderException {
        Optional<Order> opt = orderRepository.findById(orderId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new OrderException("Order not found with id: " + orderId);
    }

    @Override
    public List<Order> usersOrderHistory(Long userId) {
        return orderRepository.getUsersOrders(userId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteOrder(Long orderId) throws OrderException {
        findOrderById(orderId);
        orderRepository.deleteById(orderId);
    }

    @Override
    @Transactional
    public Order cancelOrderItems(Long orderId, List<Long> itemIdsToCancel) throws OrderException {
        Order order = findOrderById(orderId);

        boolean allItemsCanceled = true;

        for (OrderItem item : order.getOrderItems()) {
            // If this item is in the cancellation list and isn't already canceled
            if (itemIdsToCancel.contains(item.getId()) && !"CANCELLED".equals(item.getItemStatus())) {

                item.setItemStatus("CANCELLED");

                // --- THE RECALCULATION MATH ---
                // Subtract this item's original price * quantity from the Order total
                order.setTotalPrice(order.getTotalPrice() - (item.getPrice() * item.getQuantity()));

                // Subtract this item's discounted price * quantity from the Order total
                order.setTotalDiscountedPrice(order.getTotalDiscountedPrice() - (item.getDiscountedPrice() * item.getQuantity()));

                // Reduce the total item count
                order.setTotalItem(order.getTotalItem() - item.getQuantity());
            }

            // Check if there are any items left that are NOT canceled
            if (!"CANCELLED".equals(item.getItemStatus())) {
                allItemsCanceled = false;
            }
        }

        // Recalculate the total discount based on the new prices
        order.setDiscount((int) (order.getTotalPrice() - order.getTotalDiscountedPrice()));

        // If the user canceled EVERY item in the order, mark the entire Order as CANCELLED
        if (allItemsCanceled || order.getTotalItem() <= 0) {
            order.setOrderStatus("CANCELLED");
            order.setTotalPrice(0);
            order.setTotalDiscountedPrice(0);
            order.setDiscount(0);
        }

        // Save and return the updated order
        return orderRepository.save(order);
    }
}