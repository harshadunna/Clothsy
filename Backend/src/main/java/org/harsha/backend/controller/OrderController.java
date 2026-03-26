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
import org.harsha.backend.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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
    private final InvoiceService invoiceService;

    /**
     * Places a new order using an existing saved address.
     */
    @PostMapping({"", "/"})
    public ResponseEntity<Order> createOrder(
            @RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String jwt) throws UserException {

        User user = userService.findUserProfileByJwt(jwt);

        // Safely extract the addressId
        Long addressId = body.get("addressId");
        Order order = orderService.createOrder(user, addressId);

        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    /**
     * Retrieves the full order history for the authenticated user.
     */
    @GetMapping("/user")
    public ResponseEntity<List<Order>> getUserOrderHistory(
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        User user = userService.findUserProfileByJwt(jwt);
        List<Order> orders = orderService.usersOrderHistory(user.getId());

        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    /**
     * Retrieves a specific order by its ID.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> findOrderById(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        // Verify the user exists
        userService.findUserProfileByJwt(jwt);
        Order order = orderService.findOrderById(orderId);

        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    /**
     * Partially (or fully) cancels items within an order.
     * Expects a JSON array of OrderItem IDs: [1, 5, 8]
     */
    @PutMapping("/{orderId}/cancel-items")
    public ResponseEntity<Order> cancelOrderItems(
            @PathVariable Long orderId,
            @RequestBody List<Long> itemIdsToCancel,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        // Verify user owns the token
        userService.findUserProfileByJwt(jwt);

        Order updatedOrder = orderService.cancelOrderItems(orderId, itemIdsToCancel);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    /**
     * Requests a return for specific items within an order.
     * Enforces the 7-day return policy on the backend.
     */
    @PutMapping("/{orderId}/return-items")
    public ResponseEntity<Order> returnOrderItems(
            @PathVariable Long orderId,
            @RequestBody List<Long> itemIdsToReturn,
            @RequestHeader("Authorization") String jwt) throws OrderException, UserException {

        // Verify user owns the token
        userService.findUserProfileByJwt(jwt);

        Order updatedOrder = orderService.returnOrderItems(orderId, itemIdsToReturn);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    /**
     * Downloads the PDF Invoice for a specific order.
     */
    @GetMapping("/{orderId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) throws Exception {

        // 1. Verify user and get order
        userService.findUserProfileByJwt(jwt);
        Order order = orderService.findOrderById(orderId);

        // 2. Generate PDF
        byte[] pdfBytes = invoiceService.generateInvoicePdf(order);

        // 3. Set headers for file download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Invoice_Order_" + orderId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}