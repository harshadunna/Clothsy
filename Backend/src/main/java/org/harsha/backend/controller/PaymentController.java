package org.harsha.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
            System.err.println("Webhook signature verification failed.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Signature");
        } catch (Exception e) {
            System.err.println("Webhook payload parsing failed.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook Error");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                String orderIdStr = null;

                // 1. Try standard Stripe Deserialization
                if (event.getDataObjectDeserializer().getObject().isPresent()) {
                    Session session = (Session) event.getDataObjectDeserializer().getObject().get();
                    if (session.getMetadata() != null) {
                        orderIdStr = session.getMetadata().get("order_id");
                    }
                }
                // 2. FALLBACK: If API versions mismatch, parse the raw JSON directly
                else {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode node = mapper.readTree(event.getDataObjectDeserializer().getRawJson());
                    if (node.has("metadata") && node.get("metadata").has("order_id")) {
                        orderIdStr = node.get("metadata").get("order_id").asText();
                    }
                }

                // 3. Process the Order
                if (orderIdStr != null) {
                    Long orderId = Long.parseLong(orderIdStr);
                    orderService.placedOrder(orderId);
                    System.out.println("SUCCESS: Order #" + orderId + " is now marked as PLACED. Inventory deducted.");
                } else {
                    System.err.println("WEBHOOK ALERT: Session completed but no order_id found in metadata.");
                }

            } catch (Exception e) {
                System.err.println("WEBHOOK ERROR processing session: " + e.getMessage());
                // We return OK so Stripe doesn't infinitely retry a broken payload
                return ResponseEntity.ok("Processed with internal errors");
            }
        }
        return ResponseEntity.ok("Success");
    }
}