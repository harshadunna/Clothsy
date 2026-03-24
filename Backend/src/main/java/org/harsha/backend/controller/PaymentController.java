package org.harsha.backend.controller;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.harsha.backend.model.Order;
import org.harsha.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderService orderService;

    @Value("${stripe.api.key}")
    private String stripeSecretKey;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Creates a Stripe Checkout Session and returns the payment URL.
     * Updated to include Metadata for better tracking in the Stripe Dashboard.
     */
    @PostMapping("/{orderId}")
    public ResponseEntity<Map<String, String>> createPaymentLink(@PathVariable Long orderId,
                                                                 @RequestHeader("Authorization") String jwt) throws Exception {

        Order order = orderService.findOrderById(orderId);

        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                // Success and Cancel URLs pointed to Vite port 5173
                .setSuccessUrl("http://localhost:5173/payment/success?order_id=" + orderId)
                .setCancelUrl("http://localhost:5173/payment/cancel?order_id=" + orderId)

                // --- NEW: METADATA FOR STRIPE DASHBOARD ---
                .putMetadata("order_id", orderId.toString())
                .putMetadata("customer_email", order.getUser().getEmail())
                .putMetadata("customer_name", order.getUser().getFirstName() + " " + order.getUser().getLastName())

                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                // Amount in paise (total * 100)
                                .setUnitAmount((long) order.getTotalDiscountedPrice() * 100)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Order #" + orderId)
                                        .setDescription("Payment for items in your Harsha Backend Shop cart")
                                        .build())
                                .build())
                        .build())
                .build();

        Session session = Session.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("payment_url", session.getUrl());
        response.put("session_id", session.getId());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * Endpoint called by the React Success page to finalize the order in the database.
     */
    @GetMapping("/update_payment")
    public ResponseEntity<String> updatePaymentStatus(@RequestParam("order_id") Long orderId) throws Exception {
        // Marks order as PLACED and updates payment status to COMPLETED
        orderService.placedOrder(orderId);

        return new ResponseEntity<>("Payment status updated to PLACED successfully", HttpStatus.OK);
    }
}