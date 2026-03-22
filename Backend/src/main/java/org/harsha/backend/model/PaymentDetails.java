package org.harsha.backend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PaymentDetails (Embeddable)
 *
 * Represents payment information embedded directly into the Order entity.
 * Tracks the payment method and current payment status.
 *
 * Not a separate table — fields are stored as columns in the orders table.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDetails {

    /** Payment method used (e.g. "RAZORPAY", "COD", "UPI") */
    private String paymentMethod;

    /**
     * Current payment status.
     * (e.g. "PENDING", "COMPLETED", "FAILED", "REFUNDED")
     */
    private String status;

    /** Payment gateway transaction ID for reference */
    private String paymentId;

    /** Razorpay payment link ID */
    private String razorpayPaymentLinkId;

    /** Razorpay payment link reference ID */
    private String razorpayPaymentLinkReferenceId;

    /** Current status of the Razorpay payment link */
    private String razorpayPaymentLinkStatus;

    /** Razorpay specific payment ID */
    private String razorpayPaymentId;
}