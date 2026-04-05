package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.*;
import org.harsha.backend.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderServiceImplementation implements OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final EmailApiService emailApiService;

    @Override
    @Transactional
    public Order createOrder(User user, Long addressId) {
        Address shippingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        Cart cart = cartService.findUserCart(user.getId());

        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(cart.getTotalPrice());
        order.setTotalDiscountedPrice(cart.getTotalDiscountedPrice());
        order.setDiscount(cart.getDiscount());
        order.setTotalItem(cart.getTotalItem());
        order.setShippingAddress(shippingAddress);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("PENDING");
        order.getPaymentDetails().setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setOrderId(UUID.randomUUID().toString());

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setPrice(item.getPrice());
            orderItem.setProduct(item.getProduct());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setSize(item.getSize());
            orderItem.setUserId(item.getUserId());
            orderItem.setDiscountedPrice(item.getDiscountedPrice());
            orderItem.setItemStatus("PENDING");
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);

        Order fullyLoaded = orderRepository.findOrderById(savedOrder.getId())
                .orElseThrow(() -> new RuntimeException("Order not found after save"));

        emailApiService.sendOrderUpdateEmail(fullyLoaded, "PLACED");
        return fullyLoaded;
    }

    @Override
    @Transactional
    public Order placedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("PLACED");
        order.getPaymentDetails().setStatus("COMPLETED");

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(Math.max(0, product.getQuantity() - item.getQuantity()));
                for (Size s : product.getSizes()) {
                    if (s.getName().equalsIgnoreCase(item.getSize())) {
                        s.setQuantity(Math.max(0, s.getQuantity() - item.getQuantity()));
                        break;
                    }
                }
                productRepository.save(product);
            }
        }

        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "PLACED");
        return saved;
    }

    @Override
    @Transactional
    public Order confirmedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CONFIRMED");
        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "CONFIRMED");
        return saved;
    }

    @Override
    @Transactional
    public Order shippedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("SHIPPED");
        LocalDateTime now = LocalDateTime.now();
        order.setShippedAt(now);
        int randomDays = ThreadLocalRandom.current().nextInt(2, 8);
        order.setEstimatedDeliveryAt(now.plusDays(randomDays));
        order.setTrackingNumber("AWB-" + System.currentTimeMillis());
        order.getTrackingHistory().add(now + "|Package dispatched from Clothsy Atelier.");
        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "SHIPPED");
        return saved;
    }

    @Override
    @Transactional
    public Order deliveredOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("DELIVERED");
        order.setDeliveryDate(LocalDate.now());
        for (OrderItem item : order.getOrderItems()) {
            if (!"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("DELIVERED");
                item.setDeliveryDate(LocalDateTime.now());
            }
        }
        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "DELIVERED");
        return saved;
    }

    @Override
    @Transactional
    public Order cancelOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CANCELLED");
        for (OrderItem item : order.getOrderItems()) {
            if (!"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("CANCELLED");
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    for (Size s : product.getSizes()) {
                        if (s.getName().equalsIgnoreCase(item.getSize())) {
                            s.setQuantity(s.getQuantity() + item.getQuantity());
                            break;
                        }
                    }
                    productRepository.save(product);
                }
            }
        }
        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "CANCELLED");
        return saved;
    }

    @Override
    public Order findOrderById(Long orderId) throws OrderException {
        // FIX: Changed from findByIdWithItems to findOrderById
        return orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new OrderException("Order not found with id: " + orderId));
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
        orderRepository.deleteById(orderId);
    }

    @Override
    @Transactional
    public Order cancelOrderItems(Long orderId, List<Long> itemIdsToCancel) throws OrderException {
        Order order = findOrderById(orderId);
        boolean allItemsCancelled = true;

        for (OrderItem item : order.getOrderItems()) {
            if (itemIdsToCancel.contains(item.getId()) && !"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("CANCELLED");
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    for (Size s : product.getSizes()) {
                        if (s.getName().equalsIgnoreCase(item.getSize())) {
                            s.setQuantity(s.getQuantity() + item.getQuantity());
                            break;
                        }
                    }
                    productRepository.save(product);
                }
                order.setTotalPrice(order.getTotalPrice() - (item.getPrice() * item.getQuantity()));
                order.setTotalDiscountedPrice(order.getTotalDiscountedPrice() - (item.getDiscountedPrice() * item.getQuantity()));
                order.setTotalItem(order.getTotalItem() - item.getQuantity());
            }
            if (!"CANCELLED".equals(item.getItemStatus())) {
                allItemsCancelled = false;
            }
        }

        order.setDiscount((int) (order.getTotalPrice() - order.getTotalDiscountedPrice()));
        if (allItemsCancelled) {
            order.setOrderStatus("CANCELLED");
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order returnOrderItems(Long orderId, List<Long> itemIdsToReturn) throws OrderException {
        Order order = findOrderById(orderId);
        boolean hasReturnRequest = false;

        for (OrderItem item : order.getOrderItems()) {
            if (itemIdsToReturn.contains(item.getId()) && "DELIVERED".equals(item.getItemStatus())) {
                item.setItemStatus("RETURN_REQUESTED");
                hasReturnRequest = true;
            }
        }

        if (hasReturnRequest) {
            order.setOrderStatus("RETURN_REQUESTED");
            order.setReturnRequestedAt(LocalDateTime.now());
            order.getTrackingHistory().add(LocalDateTime.now() + "|Return requested. Waiting for courier pickup.");
            Order saved = orderRepository.save(order);
            emailApiService.sendOrderUpdateEmail(saved, "RETURN_REQUESTED");
            return saved;
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order returnPickedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("RETURN_PICKED");
        for (OrderItem item : order.getOrderItems()) {
            if ("RETURN_REQUESTED".equals(item.getItemStatus())) {
                item.setItemStatus("RETURN_PICKED");
            }
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order returnReceivedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("RETURN_RECEIVED");
        for (OrderItem item : order.getOrderItems()) {
            if ("RETURN_PICKED".equals(item.getItemStatus())) {
                item.setItemStatus("RETURN_RECEIVED");
            }
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order refundInitiatedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("REFUND_INITIATED");
        for (OrderItem item : order.getOrderItems()) {
            if ("RETURN_RECEIVED".equals(item.getItemStatus())) {
                item.setItemStatus("REFUND_INITIATED");
            }
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order refundCompletedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        for (OrderItem item : order.getOrderItems()) {
            if ("REFUND_INITIATED".equals(item.getItemStatus())) {
                item.setItemStatus("REFUND_COMPLETED");
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    for (Size s : product.getSizes()) {
                        if (s.getName().equalsIgnoreCase(item.getSize())) {
                            s.setQuantity(s.getQuantity() + item.getQuantity());
                            break;
                        }
                    }
                    productRepository.save(product);
                }
            }
        }
        order.setOrderStatus("REFUND_COMPLETED");
        Order saved = orderRepository.save(order);
        emailApiService.sendOrderUpdateEmail(saved, "REFUND_COMPLETED");
        return saved;
    }


    @Scheduled(fixedRate = 60000)
    @Transactional
    public void simulateCourierTracking() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> allOrders = orderRepository.findActiveOrdersForTracking();

        for (Order order : allOrders) {
            // 1. FORWARD LOGISTICS (DELIVERY)
            if (order.getShippedAt() != null
                    && ("SHIPPED".equals(order.getOrderStatus()) || "OUT_FOR_DELIVERY".equals(order.getOrderStatus()))) {

                long totalDuration = Duration.between(order.getShippedAt(), order.getEstimatedDeliveryAt()).toSeconds();
                long elapsed = Duration.between(order.getShippedAt(), now).toSeconds();

                if (totalDuration <= 0) continue;

                double progress = (double) elapsed / totalDuration;

                if (progress >= 1.0) {
                    try { deliveredOrder(order.getId()); } catch (Exception ignored) {}
                } else if (progress >= 0.85 && order.getTrackingHistory().size() == 3) {
                    order.setOrderStatus("OUT_FOR_DELIVERY");
                    order.getTrackingHistory().add(now + "|Out for delivery.");
                    orderRepository.save(order);
                } else if (progress >= 0.50 && order.getTrackingHistory().size() == 2) {
                    order.getTrackingHistory().add(now + "|In transit to destination city.");
                    orderRepository.save(order);
                } else if (progress >= 0.20 && order.getTrackingHistory().size() == 1) {
                    order.getTrackingHistory().add(now + "|Arrived at Regional Hub.");
                    orderRepository.save(order);
                }
            }

            // 2. REVERSE LOGISTICS (RETURNS) 
            if (order.getReturnRequestedAt() != null
                    && !"REFUND_COMPLETED".equals(order.getOrderStatus())) {

                long returnElapsed = Duration.between(order.getReturnRequestedAt(), now).toHours();

                if (returnElapsed >= 60 && "REFUND_INITIATED".equals(order.getOrderStatus())) {
                    try {
                        Order updated = refundCompletedOrder(order.getId());
                        updated.getTrackingHistory().add(now + "|Refund successfully credited to original payment source.");
                        orderRepository.save(updated);
                    } catch (Exception ignored) {}
                } else if (returnElapsed >= 48 && "RETURN_RECEIVED".equals(order.getOrderStatus())) {
                    try {
                        Order updated = refundInitiatedOrder(order.getId());
                        updated.getTrackingHistory().add(now + "|Return verified. Refund initiated.");
                        orderRepository.save(updated);
                    } catch (Exception ignored) {}
                } else if (returnElapsed >= 36 && "RETURN_PICKED".equals(order.getOrderStatus())) {
                    try {
                        Order updated = returnReceivedOrder(order.getId());
                        updated.getTrackingHistory().add(now + "|Arrived at Clothsy Archive Warehouse. Quality inspection in progress.");
                        orderRepository.save(updated);
                    } catch (Exception ignored) {}
                } else if (returnElapsed >= 12 && "RETURN_REQUESTED".equals(order.getOrderStatus())) {
                    try {
                        Order updated = returnPickedOrder(order.getId());
                        updated.getTrackingHistory().add(now + "|Piece collected by courier agent.");
                        orderRepository.save(updated);
                    } catch (Exception ignored) {}
                }
            }
        }
    }
}