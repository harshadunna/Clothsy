package org.harsha.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.harsha.backend.model.Order;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailApiService {

    @Value("${resend.api.key}")
    private String apiKey;

    private final InvoiceService invoiceService;
    private final ObjectMapper objectMapper;

    // ── 1. Inject the InvoiceService and ObjectMapper ──
    public EmailApiService(InvoiceService invoiceService, ObjectMapper objectMapper) {
        this.invoiceService = invoiceService;
        this.objectMapper = objectMapper;
    }

    /**
     * The Master Notification Engine
     */
    public void sendOrderUpdateEmail(Order order, String updateType) {
        String subject;
        String title;
        String message;
        String themeColor = "#c8742a"; // Clothsy Brand Orange

        // 2. Determine Email Content Based on Status
        switch (updateType) {
            case "PLACED":
                subject = "Order Confirmed! - #" + order.getId();
                title = "Order Confirmed!";
                message = "We've received your order and are getting it ready. We will notify you the moment it ships. Your official tax invoice is attached to this email.";
                break;
            case "CONFIRMED":
                subject = "Your order is being packed! - #" + order.getId();
                title = "Order Processing";
                message = "Great news! Your items are currently being packed at our fulfillment center.";
                break;
            case "SHIPPED":
                subject = "Your order has shipped! - #" + order.getId();
                title = "It's on the way!";
                message = "Your order has left our facility and is on its way to you. Keep an eye out for the delivery partner.";
                themeColor = "#3b82f6"; // Blue
                break;
            case "DELIVERED":
                subject = "Delivered: Your package has arrived!";
                title = "Package Delivered!";
                message = "Your order has been successfully delivered. We hope you love it! If you have any issues, you have 7 days to request a return.";
                themeColor = "#16a34a"; // Green
                break;
            case "CANCELLED":
                subject = "Order Cancelled - #" + order.getId();
                title = "Order Cancelled";
                message = "As requested, your order has been cancelled. Any payments made will be refunded to your original payment method within 3-5 business days.";
                themeColor = "#dc2626"; // Red
                break;
            case "RETURN_REQUESTED":
                subject = "Return Request Received - #" + order.getId();
                title = "Return Initiated";
                message = "We have received your return request. A pickup agent will contact you within 24-48 hours.";
                themeColor = "#9333ea"; // Purple
                break;
            case "REFUND_COMPLETED":
                subject = "Refund Processed Successfully - #" + order.getId();
                title = "Refund Issued";
                message = "We have successfully processed a refund of ₹" + order.getTotalDiscountedPrice() + " to your original payment method. Please allow a few days for it to reflect in your bank statement.";
                themeColor = "#16a34a"; // Green
                break;
            default:
                subject = "Update on your order - #" + order.getId();
                title = "Order Update";
                message = "There has been an update to your order. Please check your account dashboard for details.";
        }

        // 3. Build Payload & Attach PDF via Resend
        try {
            String htmlContent = buildDynamicHtml(order, title, message, themeColor);

            // Safely build the JSON using Maps
            Map<String, Object> payload = new HashMap<>();
            payload.put("from", "Clothsy <onboarding@resend.dev>"); // Updated Brand Name
            payload.put("to", List.of(order.getUser().getEmail()));
            payload.put("subject", subject);
            payload.put("html", htmlContent);

            // ONLY ATTACH THE PDF IF THIS IS THE INITIAL ORDER CONFIRMATION
            if ("PLACED".equals(updateType)) {
                // Generate the raw PDF bytes
                byte[] pdfBytes = invoiceService.generateInvoicePdf(order);
                // Convert bytes to Base64 String for the API
                String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

                // Create the attachment object
                Map<String, String> attachment = new HashMap<>();
                attachment.put("filename", "Clothsy_Invoice_Order_" + order.getId() + ".pdf");
                attachment.put("content", base64Pdf);

                // Add to payload
                payload.put("attachments", List.of(attachment));
            }

            // Convert Map to JSON String safely
            String jsonPayload = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                System.out.println("[" + updateType + "] Email sent to: " + order.getUser().getEmail());
            } else {
                System.err.println("API Error: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger email API: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Builds a clean, dynamic HTML template that changes colors and text based on the status.
     */
    private String buildDynamicHtml(Order order, String title, String message, String themeColor) {
        return "<div style=\"font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e8ddd5; border-radius: 16px; background-color: #ffffff;\">" +
                "<div style=\"text-align: center; margin-bottom: 30px;\">" +
                "<h2 style=\"color: #1a1109; margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;\">Clothsy</h2>" +
                "<h1 style=\"color: " + themeColor + "; margin: 10px 0 0 0; font-size: 28px;\">" + title + "</h1>" +
                "</div>" +
                "<p style=\"color: #1a1109; font-size: 16px;\">Hi <strong>" + order.getUser().getFirstName() + "</strong>,</p>" +
                "<p style=\"color: #555555; line-height: 1.6; font-size: 15px;\">" + message + "</p>" +
                "<div style=\"background-color: #fafafa; padding: 20px; border-radius: 12px; border: 1px solid #eeeeee; margin: 25px 0;\">" +
                "<h3 style=\"margin-top: 0; color: #1a1109; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;\">Order Details</h3>" +
                "<p style=\"margin: 8px 0; color: #555;\"><strong>Order Number:</strong> #" + order.getId() + "</p>" +
                "<p style=\"margin: 8px 0; color: #555;\"><strong>Current Status:</strong> <span style=\"color: " + themeColor + "; font-weight: bold;\">" + order.getOrderStatus() + "</span></p>" +
                "<p style=\"margin: 15px 0 0 0; font-size: 18px; color: #1a1109;\"><strong>Total Amount:</strong> ₹" + order.getTotalDiscountedPrice() + "</p>" +
                "</div>" +
                "<a href=\"http://localhost:5173/account/orders\" style=\"display: inline-block; background-color: #1a1109; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;\">View Order History</a>" +
                "<p style=\"color: #1a1109; margin-top: 20px;\">Warm regards,<br><strong style=\"color: #c8742a;\">The Clothsy Team</strong></p>" +
                "</div>";
    }
}