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

/**
 * OrderServiceImplementation
 *
 * Core business logic for the entire order lifecycle:
 * Create → Place → Confirm → Ship → Deliver → Return → Refund / Cancel
 *
 * KEY FIXES APPLIED IN THIS FILE:
 *
 * 1. createOrder() — Save Order first to get a managed entity with a real DB id,
 *    then build OrderItems referencing that managed entity, then saveAll() items
 *    explicitly. Finally reload from DB to guarantee no stale Hibernate cache.
 *
 * 2. findOrderById() — Now delegates to findByIdWithItems() which uses
 *    LEFT JOIN FETCH so orderItems are always loaded. Every other method
 *    in this service calls findOrderById() first, so this single fix
 *    ensures all operations work on fully-loaded Order entities.
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
    private final ProductRepository productRepository;

    /**
     * Creates a new Order from the user's current Cart.
     *
     * FIX SUMMARY:
     * The original code set orderItem.setOrder(order) on a transient (unsaved)
     * Order, then relied on CascadeType.ALL to save everything together.
     * This caused Hibernate to sometimes write order_id = NULL in order_items.
     *
     * The fixed flow is:
     * Step 1 — Persist the Order first (no items yet) → get a managed entity with real id
     * Step 2 — Build OrderItems referencing the managed savedOrder
     * Step 3 — saveAll(orderItems) explicitly → guarantees FK is written correctly
     * Step 4 — Attach saved items back onto savedOrder (keeps in-memory state consistent)
     * Step 5 — flush() + fresh findByIdWithItems() reload → eliminates stale L1 cache
     *
     * @param user      the authenticated user placing the order
     * @param addressId the ID of the saved address to ship to
     * @return the fully-persisted and reloaded Order with all items populated
     */
    @Override
    @Transactional
    public Order createOrder(User user, Long addressId) {

        // Resolve the shipping address or fail fast
        Address shippingAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        // Load the user's cart
        Cart cart = cartService.findUserCart(user.getId());

        // STEP 1: Persist Order first (no items yet) to get a real DB id 
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

        // savedOrder is now a fully managed JPA entity with a real primary key
        Order savedOrder = orderRepository.save(order);

        // STEP 2: Build OrderItems referencing the MANAGED savedOrder 
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

            // Link to the already-persisted savedOrder — FK will never be NULL
            orderItem.setOrder(savedOrder);
            orderItems.add(orderItem);
        }

        // STEP 3: Explicitly save all items so order_id FK is written correctly 
        List<OrderItem> savedItems = orderItemRepository.saveAll(orderItems);

        // STEP 4: Attach items back onto savedOrder for in-memory consistency 
        savedOrder.setOrderItems(savedItems);

        // STEP 5: Flush + fresh reload to eliminate any stale Hibernate L1 cache 
        orderRepository.flush();
        return orderRepository.findByIdWithItems(savedOrder.getId())
                .orElseThrow(() -> new RuntimeException("Order not found after save"));
    }

    /**
     * Marks an order as PLACED and deducts inventory for all items.
     * Decrements both the product's total quantity and the specific size stock.
     *
     * @param orderId the ID of the order to place
     * @return the updated Order with PLACED status
     */
    @Override
    @Transactional
    public Order placedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("PLACED");
        order.getPaymentDetails().setStatus("COMPLETED");

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null) {
                // Deduct from total product quantity (floor at 0)
                product.setQuantity(Math.max(0, product.getQuantity() - item.getQuantity()));

                // Deduct from the specific size stock
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

    /**
     * Marks an order as CONFIRMED (e.g. after payment verification).
     *
     * @param orderId the ID of the order to confirm
     * @return the updated Order with CONFIRMED status
     */
    @Override
    public Order confirmedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    /**
     * Marks an order as SHIPPED.
     *
     * @param orderId the ID of the order to ship
     * @return the updated Order with SHIPPED status
     */
    @Override
    public Order shippedOrder(Long orderId) throws OrderException {
        Order order = findOrderById(orderId);
        order.setOrderStatus("SHIPPED");
        return orderRepository.save(order);
    }

    /**
     * Marks an order as DELIVERED and timestamps each non-cancelled item.
     * The per-item deliveryDate is used later for return eligibility checks.
     *
     * @param orderId the ID of the order to deliver
     * @return the updated Order with DELIVERED status
     */
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

    /**
     * Cancels an entire order and restores inventory for all non-cancelled items.
     * Increments both total product quantity and the specific size stock.
     *
     * @param orderId the ID of the order to cancel
     * @return the updated Order with CANCELLED status
     */
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
                    // Restore total product quantity
                    product.setQuantity(product.getQuantity() + item.getQuantity());

                    // Restore the specific size stock
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

    /**
     * Loads a fully-populated Order by its primary key.
     *
     * FIX: Now uses findByIdWithItems() instead of plain findById().
     * findByIdWithItems() uses LEFT JOIN FETCH so orderItems and their
     * products are always loaded in the same query — no lazy loading,
     * no stale cache, no empty arrays.
     *
     * Every other method in this service calls findOrderById() first,
     * so this single fix propagates to all operations.
     *
     * @param orderId the primary key of the order
     * @return the fully-loaded Order
     * @throws OrderException if no order exists with the given id
     */
    @Override
    public Order findOrderById(Long orderId) throws OrderException {
        return orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new OrderException("Order not found with id: " + orderId));
    }

    /**
     * Returns the full order history for a given user.
     * Delegates to getUsersOrders() which uses JOIN FETCH internally.
     *
     * @param userId the ID of the user
     * @return list of fully-loaded Orders for that user
     */
    @Override
    public List<Order> usersOrderHistory(Long userId) {
        return orderRepository.getUsersOrders(userId);
    }

    /**
     * Returns all orders in the system sorted by creation date descending.
     * Used by the admin panel.
     *
     * @return list of all orders, newest first
     */
    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Deletes an order by ID. Verifies the order exists before deletion.
     *
     * @param orderId the ID of the order to delete
     * @throws OrderException if no order exists with the given id
     */
    @Override
    public void deleteOrder(Long orderId) throws OrderException {
        findOrderById(orderId);
        orderRepository.deleteById(orderId);
    }

    /**
     * Partially or fully cancels specific items within an order.
     *
     * For each cancelled item:
     * - Sets itemStatus to CANCELLED
     * - Restores product quantity and size-level stock
     * - Subtracts item cost from order totals
     *
     * If ALL items end up cancelled (or totalItem drops to 0),
     * the entire order is marked CANCELLED and all totals zeroed out.
     *
     * @param orderId          the ID of the order containing the items
     * @param itemIdsToCancel  list of OrderItem IDs to cancel
     * @return the updated Order
     */
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

                // Subtract this item's cost from the running order totals
                order.setTotalPrice(order.getTotalPrice() - (item.getPrice() * item.getQuantity()));
                order.setTotalDiscountedPrice(
                        order.getTotalDiscountedPrice() - (item.getDiscountedPrice() * item.getQuantity()));
                order.setTotalItem(order.getTotalItem() - item.getQuantity());
            }

            // Track whether any non-cancelled item still exists
            if (!"CANCELLED".equals(item.getItemStatus())) {
                allItemsCanceled = false;
            }
        }

        // Recalculate discount from updated totals
        order.setDiscount((int) (order.getTotalPrice() - order.getTotalDiscountedPrice()));

        // If everything is cancelled, zero out the order completely
        if (allItemsCanceled || order.getTotalItem() <= 0) {
            order.setOrderStatus("CANCELLED");
            order.setTotalPrice(0);
            order.setTotalDiscountedPrice(0);
            order.setDiscount(0);
        }

        return orderRepository.save(order);
    }

    /**
     * Requests a return for specific delivered items within an order.
     *
     * Eligibility rules (enforced on the backend):
     * - Item must currently be in DELIVERED status
     * - Return must be requested within 7 days of delivery
     * - If no deliveryDate is recorded at all, the item is eligible by default
     *
     * @param orderId           the ID of the order containing the items
     * @param itemIdsToReturn   list of OrderItem IDs to return
     * @return the updated Order with RETURN_REQUESTED status (if any item qualified)
     */
    @Override
    @Transactional
    public Order returnOrderItems(Long orderId, List<Long> itemIdsToReturn) throws OrderException {
        Order order = findOrderById(orderId);
        boolean hasReturnRequest = false;

        for (OrderItem item : order.getOrderItems()) {
            if (itemIdsToReturn.contains(item.getId()) && "DELIVERED".equals(item.getItemStatus())) {

                // Check 7-day return window
                boolean isEligible = false;
                if (item.getDeliveryDate() != null) {
                    isEligible = item.getDeliveryDate().plusDays(7).isAfter(LocalDateTime.now());
                } else if (order.getDeliveryDate() != null) {
                    isEligible = order.getDeliveryDate().plusDays(7).isAfter(LocalDate.now());
                }

                // If no delivery date is recorded at all, allow return by default
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

    /**
     * Marks the order and all RETURN_REQUESTED items as RETURN_PICKED
     * (courier has physically collected the returned items).
     *
     * @param orderId the ID of the order being picked up
     * @return the updated Order with RETURN_PICKED status
     */
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

    /**
     * Marks the order and all RETURN_PICKED items as RETURN_RECEIVED
     * (warehouse has received and inspected the returned items).
     *
     * @param orderId the ID of the order being received
     * @return the updated Order with RETURN_RECEIVED status
     */
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

    /**
     * Marks the order and all RETURN_RECEIVED items as REFUND_INITIATED
     * (finance team has started processing the refund).
     *
     * @param orderId the ID of the order being refunded
     * @return the updated Order with REFUND_INITIATED status
     */
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

    /**
     * Completes the refund for all REFUND_INITIATED items and restores inventory.
     *
     * For each refunded item:
     * - Sets itemStatus to REFUND_COMPLETED
     * - Restores product quantity and size-level stock
     *
     * Final order status logic:
     * - If ALL items are REFUND_COMPLETED or CANCELLED → order = REFUND_COMPLETED
     * - If some items are still DELIVERED (kept by user) → order = DELIVERED
     *
     * @param orderId the ID of the order completing refund
     * @return the updated Order with appropriate final status
     */
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
                    // Restore total product quantity
                    product.setQuantity(product.getQuantity() + item.getQuantity());

                    // Restore specific size stock
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

        // Determine final order status based on item outcomes
        if (allRefundedOrCancelled) {
            order.setOrderStatus("REFUND_COMPLETED");
        } else if (hasKeptItems) {
            order.setOrderStatus("DELIVERED");
        }

        return orderRepository.save(order);
    }
}