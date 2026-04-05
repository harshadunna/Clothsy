package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.User;
import org.harsha.backend.service.OrderService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * OrderController
 *
 * REST controller handling all order-related endpoints for authenticated users.
 * All endpoints require a valid JWT token in the Authorization header.
 *
 * Base path: /api/orders
 *
 * Endpoint summary:
 * POST   /api/orders              → Create a new order from the user's cart
 * GET    /api/orders/user         → Get full order history for the logged-in user
 * GET    /api/orders/{id}         → Get a specific order by ID
 * PUT    /api/orders/{id}/cancel-items  → Partially or fully cancel items
 * PUT    /api/orders/{id}/return-items  → Request a return for delivered items
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    /**
     * POST /api/orders
     *
     * Creates a new order from the authenticated user's current cart.
     * Expects a JSON body with the ID of a saved address:
     * { "addressId": 5 }
     *
     * Flow:
     * 1. Resolve user from JWT
     * 2. Extract addressId from request body
     * 3. Delegate to OrderService to build and persist the order
     * 4. Return the created Order with HTTP 201 CREATED
     *
     * @param body JSON map containing "addressId" key
     * @param jwt  Bearer token from Authorization header
     * @return the newly created Order
     */
    @PostMapping({"", "/"})
    public ResponseEntity<Order> createOrder(
            @RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Long addressId = body.get("addressId");
        Order order = orderService.createOrder(user, addressId);

        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    /**
     * GET /api/orders/user
     *
     * Returns the full order history for the authenticated user.
     * Only returns orders with meaningful statuses (PLACED, CONFIRMED,
     * SHIPPED, DELIVERED, RETURN_*, REFUND_*, CANCELLED).
     *
     * Each Order includes its fully-loaded orderItems array
     * (fixed via JOIN FETCH in OrderRepository).
     *
     * @param jwt Bearer token from Authorization header
     * @return list of Orders belonging to the user
     */
    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrderHistory(
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        List<Order> orders = orderService.usersOrderHistory(user.getId());

        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    /**
     * GET /api/orders/{orderId}
     *
     * Retrieves a single order by its database ID.
     * Uses findByIdWithItems() under the hood so orderItems
     * are always populated in the response.
     *
     * @param orderId the primary key of the order
     * @param jwt     Bearer token from Authorization header
     * @return the matching Order
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> findOrderById(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        userService.findUserProfileByJwt(jwt);
        Order order = orderService.findOrderById(orderId);

        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    /**
     * PUT /api/orders/{orderId}/cancel-items
     *
     * Cancels specific items within an order.
     * If all items end up cancelled, the whole order is marked CANCELLED.
     * Inventory is restocked for each cancelled item.
     *
     * Request body: JSON array of OrderItem IDs to cancel
     * Example: [1, 5, 8]
     *
     * @param orderId        the ID of the order containing the items
     * @param itemIdsToCancel list of OrderItem IDs to cancel
     * @param jwt            Bearer token from Authorization header
     * @return the updated Order reflecting the cancellation
     */
    @PutMapping("/{orderId}/cancel-items")
    public ResponseEntity<Order> cancelOrderItems(
            @PathVariable Long orderId,
            @RequestBody List<Long> itemIdsToCancel,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        userService.findUserProfileByJwt(jwt);
        Order updatedOrder = orderService.cancelOrderItems(orderId, itemIdsToCancel);

        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    /**
     * PUT /api/orders/{orderId}/return-items
     *
     * Initiates a return request for specific delivered items.
     * Enforces the 7-day return window on the backend — items
     * delivered more than 7 days ago are silently skipped.
     *
     * Request body: JSON array of OrderItem IDs to return
     * Example: [3, 7]
     *
     * @param orderId         the ID of the order containing the items
     * @param itemIdsToReturn list of OrderItem IDs to return
     * @param jwt             Bearer token from Authorization header
     * @return the updated Order with RETURN_REQUESTED status
     */
    @PutMapping("/{orderId}/return-items")
    public ResponseEntity<Order> returnOrderItems(
            @PathVariable Long orderId,
            @RequestBody List<Long> itemIdsToReturn,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        userService.findUserProfileByJwt(jwt);
        Order updatedOrder = orderService.returnOrderItems(orderId, itemIdsToReturn);

        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }
}