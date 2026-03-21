package org.harsha.backend.Model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * PaymentInformation (Embeddable)
 *
 * Represents payment card details embedded directly into a parent entity.
 * This is NOT a separate database table — its fields are stored as columns
 * in the owning entity's table.
 *
 * This class is for educational/demo purposes only.
 * Use a payment gateway (Stripe, Razorpay) and store only their tokens.
 * Storing CVV violates PCI-DSS compliance regulations.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInformation {

    /** Name of the cardholder exactly as it appears on the card */
    private String cardholderName;

    /**
     * Card number — for demo only.
     * In production, replace with a payment gateway token.
     */
    private String cardNumber;

    /**
     * Card expiration date.
     * Format: YYYY-MM-DD (stored as LocalDate internally).
     */
    private LocalDate expirationDate;

    /**
     * Card Verification Value (3–4 digit security code) — for demo only.
     * Storing CVV in production violates PCI-DSS. Use tokenization instead.
     */
    private String cvv;
}
