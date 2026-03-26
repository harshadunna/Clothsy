package org.harsha.backend.service;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.*;
import org.harsha.backend.repository.AddressRepository;
import org.harsha.backend.repository.OrderItemRepository;
import org.harsha.backend.repository.OrderRepository;
import org.harsha.backend.repository.ProductRepository;
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
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Order createOrder(User user, Long addressId) {
        Address shippingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        Cart cart = cartService.findUserCart(user.getId());
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

            orderItems.add(orderItemRepository.save(orderItem));
        }

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
        order.setOrderId(UUID.randomUUID().toString());

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        return savedOrder;
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

                String purchasedSize = item.getSize();
                for (Size sizeObj : product.getSizes()) {
                    if (sizeObj.getName().equalsIgnoreCase(purchasedSize)) {
                        sizeObj.setQuantity(Math.max(0, sizeObj.getQuantity() - item.getQuantity()));
                        break;
                    }
                }
                productRepository.save(product);
            }
        }
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
        order.setDeliveryDate(LocalDate.now());

        for (OrderItem item : order.getOrderItems()) {
            if (!"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("DELIVERED");
                item.setDeliveryDate(LocalDateTime.now());
            }
        }
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    public Order cancledOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CANCELLED");

        for (OrderItem item : order.getOrderItems()) {
            if (!"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("CANCELLED");
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());

                    String canceledSize = item.getSize();
                    for (Size sizeObj : product.getSizes()) {
                        if (sizeObj.getName().equalsIgnoreCase(canceledSize)) {
                            sizeObj.setQuantity(sizeObj.getQuantity() + item.getQuantity());
                            break;
                        }
                    }
                    productRepository.save(product);
                }
            }
        }
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
            if (itemIdsToCancel.contains(item.getId()) && !"CANCELLED".equals(item.getItemStatus())) {
                item.setItemStatus("CANCELLED");

                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());

                    String canceledSize = item.getSize();
                    for (Size sizeObj : product.getSizes()) {
                        if (sizeObj.getName().equalsIgnoreCase(canceledSize)) {
                            sizeObj.setQuantity(sizeObj.getQuantity() + item.getQuantity());
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
                allItemsCanceled = false;
            }
        }

        order.setDiscount((int) (order.getTotalPrice() - order.getTotalDiscountedPrice()));

        if (allItemsCanceled || order.getTotalItem() <= 0) {
            order.setOrderStatus("CANCELLED");
            order.setTotalPrice(0);
            order.setTotalDiscountedPrice(0);
            order.setDiscount(0);
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
                boolean isEligible = false;
                if (item.getDeliveryDate() != null) {
                    isEligible = item.getDeliveryDate().plusDays(7).isAfter(LocalDateTime.now());
                } else if (order.getDeliveryDate() != null) {
                    isEligible = order.getDeliveryDate().plusDays(7).isAfter(LocalDate.now());
                }

                if (isEligible || (item.getDeliveryDate() == null && order.getDeliveryDate() == null)) {
                    item.setItemStatus("RETURN_REQUESTED");
                    hasReturnRequest = true;
                }
            }
        }

        if (hasReturnRequest) {
            order.setOrderStatus("RETURN_REQUESTED");
        }

        return orderRepository.save(order);
    }

    @Override
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

        boolean allRefundedOrCancelled = true;
        boolean hasKeptItems = false;

        for (OrderItem item : order.getOrderItems()) {
            if ("REFUND_INITIATED".equals(item.getItemStatus())) {
                item.setItemStatus("REFUND_COMPLETED");

                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());

                    String refundedSize = item.getSize();
                    for (Size sizeObj : product.getSizes()) {
                        if (sizeObj.getName().equalsIgnoreCase(refundedSize)) {
                            sizeObj.setQuantity(sizeObj.getQuantity() + item.getQuantity());
                            break;
                        }
                    }
                    productRepository.save(product);
                }
            }

            String status = item.getItemStatus();
            if (!"REFUND_COMPLETED".equals(status) && !"CANCELLED".equals(status)) {
                allRefundedOrCancelled = false;
            }
            if ("DELIVERED".equals(status)) {
                hasKeptItems = true;
            }
        }

        if (allRefundedOrCancelled) {
            order.setOrderStatus("REFUND_COMPLETED");
        } else if (hasKeptItems) {
            order.setOrderStatus("DELIVERED");
        }

        return orderRepository.save(order);
    }
}