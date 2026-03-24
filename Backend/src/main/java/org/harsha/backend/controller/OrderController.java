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
 * Handles all order-related endpoints for authenticated users.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    /**
     * Places a new order using an existing saved address.
     *
     * @param body map containing "addressId"
     * @param jwt  Authorization header containing the Bearer token
     * @return the newly created Order entity
     */
    @PostMapping("/")
    public ResponseEntity<Order> createOrder(
            @RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);
        Long addressId = body.get("addressId");
        Order order = orderService.createOrder(user, addressId);

        return ResponseEntity.ok(order);
    }

    /**
     * Retrieves the full order history for the authenticated user.
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
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> findOrderById(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        userService.findUserProfileByJwt(jwt);
        Order order = orderService.findOrderById(orderId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }
}