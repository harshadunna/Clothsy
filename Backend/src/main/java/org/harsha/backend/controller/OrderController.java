package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.exception.UserException;
import org.harsha.backend.model.Address;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.User;
import org.harsha.backend.service.OrderService;
import org.harsha.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * OrderController
 *
 * Handles all order-related endpoints for authenticated users.
 * All routes are protected under /api/orders and require a valid JWT.
 *
 * Responsibilities:
 * - Place a new order
 * - Retrieve order history for the authenticated user
 * - Fetch a specific order by ID
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    /**
     * Places a new order for the authenticated user.
     *
     * @param shippingAddress delivery address for the order
     * @param jwt             Authorization header containing the Bearer token
     * @return the newly created Order entity
     */
    @PostMapping("/")
    public ResponseEntity<Order> createOrder(
            @RequestBody Address shippingAddress,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Order order = orderService.createOrder(user, shippingAddress);

        return ResponseEntity.ok(order);
    }

    /**
     * Retrieves the full order history for the authenticated user.
     *
     * @param jwt Authorization header containing the Bearer token
     * @return list of all orders placed by the user
     */
    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrderHistory(
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        List<Order> orders = orderService.usersOrderHistory(user.getId());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orders);
    }

    /**
     * Retrieves a specific order by its ID.
     *
     * @param orderId ID of the order to retrieve
     * @param jwt     Authorization header containing the Bearer token
     * @return the matching Order entity
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> findOrderById(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Order order = orderService.findOrderById(orderId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }
}