package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.Order;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AdminOrderController
 *
 * Handles all admin-level order management endpoints.
 * All routes are protected under /api/admin/orders and
 * require authentication with admin privileges.
 *
 * Responsibilities:
 * - Retrieve all orders
 * - Progress order status (confirmed → shipped → delivered)
 * - Cancel or delete orders
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * Retrieves all orders placed in the system.
     *
     * @return list of all Order entities
     */
    @GetMapping("/")
    public ResponseEntity<List<Order>> getAllOrders() {

        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Marks an order as confirmed.
     *
     * @param orderId ID of the order to confirm
     * @param jwt     Authorization header for admin verification
     * @return the updated Order entity
     */
    @PutMapping("/{orderId}/confirmed")
    public ResponseEntity<Order> confirmOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.confirmedOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    /**
     * Marks an order as shipped.
     *
     * @param orderId ID of the order to ship
     * @param jwt     Authorization header for admin verification
     * @return the updated Order entity
     */
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<Order> shipOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.shippedOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    /**
     * Marks an order as delivered.
     *
     * @param orderId ID of the order to deliver
     * @param jwt     Authorization header for admin verification
     * @return the updated Order entity
     */
    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<Order> deliverOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.deliveredOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    /**
     * Marks an order as cancelled.
     *
     * @param orderId ID of the order to cancel
     * @param jwt     Authorization header for admin verification
     * @return the updated Order entity
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.cancledOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    /**
     * Permanently deletes an order from the system.
     *
     * @param orderId ID of the order to delete
     * @param jwt     Authorization header for admin verification
     * @return success message and status flag
     */
    @DeleteMapping("/{orderId}/delete")
    public ResponseEntity<ApiResponse> deleteOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        orderService.deleteOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse("Order deleted successfully", true));
    }
}