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

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping({"", "/"})
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/confirmed")
    public ResponseEntity<Order> confirmOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.confirmedOrder(orderId));
    }

    @PutMapping("/{orderId}/ship")
    public ResponseEntity<Order> shipOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.shippedOrder(orderId));
    }

    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<Order> deliverOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.deliveredOrder(orderId));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.cancelOrder(orderId));
    }

    @DeleteMapping("/{orderId}/delete")
    public ResponseEntity<ApiResponse> deleteOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        orderService.deleteOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new ApiResponse("Order deleted successfully", true));
    }

    @PutMapping("/{orderId}/return-picked")
    public ResponseEntity<Order> returnPickedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.returnPickedOrder(orderId));
    }

    @PutMapping("/{orderId}/return-received")
    public ResponseEntity<Order> returnReceivedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.returnReceivedOrder(orderId));
    }

    @PutMapping("/{orderId}/refund-initiated")
    public ResponseEntity<Order> refundInitiatedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.refundInitiatedOrder(orderId));
    }

    @PutMapping("/{orderId}/refund-completed")
    public ResponseEntity<Order> refundCompletedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(orderService.refundCompletedOrder(orderId));
    }
}