package org.harsha.backend.controller;

import lombok.RequiredArgsConstructor;
import org.harsha.backend.exception.OrderException;
import org.harsha.backend.model.Order;
import org.harsha.backend.response.ApiResponse;
import org.harsha.backend.service.EmailApiService;
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
    private final EmailApiService emailApiService;
    @GetMapping({"", "/"})
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/confirmed")
    public ResponseEntity<Order> confirmOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.confirmedOrder(orderId);
        emailApiService.sendOrderUpdateEmail(order, "CONFIRMED"); 
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/ship")
    public ResponseEntity<Order> shipOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.shippedOrder(orderId);
        emailApiService.sendOrderUpdateEmail(order, "SHIPPED");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/deliver")
    public ResponseEntity<Order> deliverOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.deliveredOrder(orderId);
        emailApiService.sendOrderUpdateEmail(order, "DELIVERED"); 
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.cancledOrder(orderId);
        emailApiService.sendOrderUpdateEmail(order, "CANCELLED"); 
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
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

        Order order = orderService.returnPickedOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/return-received")
    public ResponseEntity<Order> returnReceivedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.returnReceivedOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/refund-initiated")
    public ResponseEntity<Order> refundInitiatedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.refundInitiatedOrder(orderId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }

    @PutMapping("/{orderId}/refund-completed")
    public ResponseEntity<Order> refundCompletedOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException {

        Order order = orderService.refundCompletedOrder(orderId);
        emailApiService.sendOrderUpdateEmail(order, "REFUND_COMPLETED"); 
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(order);
    }
}