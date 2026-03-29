package org.harsha.backend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentDetails (Embeddable)
 *
 * Represents payment information embedded directly into the Order entity.
 * Tracks the payment method, current payment status, and Stripe IDs.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {

    /** Payment method used (e.g. "STRIPE", "COD", "CREDIT_CARD") */
    private String paymentMethod;

    /**
     * Internal payment status for your application.
     * (e.g. "PENDING", "COMPLETED", "FAILED", "REFUNDED")
     */
    private String status;

    /** * The ID of the Stripe Checkout Session. 
     * Essential for verifying if the user actually paid after returning from Stripe.
     */
    private String stripeSessionId;

    /** * The actual Stripe Payment Intent ID (the transaction ID).
     * Used for processing refunds or looking up the exact charge in your Stripe Dashboard.
     */
    private String stripePaymentIntentId;
    
    /** The raw status returned directly from Stripe (e.g., "paid", "unpaid", "requires_payment_method") */
    private String stripePaymentStatus;
}