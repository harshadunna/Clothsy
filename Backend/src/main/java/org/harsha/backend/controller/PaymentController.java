package org.harsha.backend.controller;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
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

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    public PaymentController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{orderId}")
    public ResponseEntity<Map<String, String>> createPaymentLink(@PathVariable Long orderId,
                                                                 @RequestHeader("Authorization") String jwt) throws Exception {
        Order order = orderService.findOrderById(orderId);
        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/payment/success?order_id=" + orderId)
                .setCancelUrl("http://localhost:5173/payment/cancel?order_id=" + orderId)
                .putMetadata("order_id", orderId.toString())
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount((long) order.getTotalDiscountedPrice() * 100)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Order #" + orderId)
                                        .build())
                                .build())
                        .build())
                .build();

        Session session = Session.create(params);
        Map<String, String> response = new HashMap<>();
        response.put("payment_url", session.getUrl());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload,
                                                      @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().get();

            // 1. Get the ID from metadata
            String orderIdStr = session.getMetadata().get("order_id");

            if (orderIdStr != null) {
                try {
                    Long orderId = Long.parseLong(orderIdStr);
                    // 2. Update the DB
                    orderService.placedOrder(orderId);
                    System.out.println("SUCCESS: Order #" + orderId + " is now marked as PLACED.");
                } catch (Exception e) {
                    // 3. Prevent the 500 error if the ID is missing from your DB
                    System.err.println("WEBHOOK ALERT: Received payment for Order ID " + orderIdStr + " but it's not in our database.");
                    return ResponseEntity.ok("Received but order not found");
                }
            }
        }
        return ResponseEntity.ok("Success");
    }
}