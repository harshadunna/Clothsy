package org.harsha.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailApiService {

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final ObjectMapper objectMapper;

    public EmailApiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // PUBLIC API

    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            String subject = "Reset Your Password - CLOTHSY";
            String htmlContent = """
                    <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #fcf9f5;">
                        <h1 style="color: #c8742a; font-family: 'Newsreader', serif; font-style: italic;">Password Reset Request</h1>
                        <p>We received a request to reset the password for your Clothsy account.</p>
                        <a href="%s" style="display: inline-block; background-color: #1a1109; color: #ffffff; padding: 14px 28px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Reset Password</a>
                    </div>
                    """.formatted(resetLink);
            sendResendEmail(email, subject, htmlContent, null, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendOrderUpdateEmail(Order order, String updateType) {
        String subject;
        String htmlContent;
        byte[] attachmentBytes = null;
        String attachmentName = null;

        switch (updateType) {
            case "PLACED":
            case "CONFIRMED":
                subject = "Order Confirmed - #" + order.getId();
                htmlContent = buildProcessingHtml(order);
                // Attach the PDF invoice to the confirmation email
                try {
                    attachmentBytes = generateInvoicePdf(order);
                    attachmentName = "Clothsy-Invoice-" + order.getId() + ".pdf";
                } catch (Exception e) {
                    System.err.println("Failed to generate invoice PDF: " + e.getMessage());
                }
                break;
            case "SHIPPED":
                subject = "Your order has shipped! - #" + order.getId();
                htmlContent = buildShippedHtml(order);
                break;
            case "DELIVERED":
                subject = "Delivered: Your package has arrived! - #" + order.getId();
                htmlContent = buildDeliveredHtml(order);
                break;
            case "CANCELLED":
                subject = "Order Cancelled - #" + order.getId();
                htmlContent = buildCancelledHtml(order);
                break;
            case "RETURN_REQUESTED":
                subject = "Return Request Received - #" + order.getId();
                htmlContent = buildReturnHtml(order);
                break;
            case "REFUND_COMPLETED":
                subject = "Refund Processed Successfully - #" + order.getId();
                htmlContent = buildRefundHtml(order);
                break;
            default:
                return;
        }

        try {
            if (htmlContent != null) {
                htmlContent = htmlContent.replace("http://localhost:5173", frontendUrl);
            }
            sendResendEmail(order.getUser().getEmail(), subject, htmlContent, attachmentBytes, attachmentName);
        } catch (Exception e) {
            System.err.println("Failed to send " + updateType + " email: " + e.getMessage());
        }
    }

    // PDF INVOICE GENERATOR

    private byte[] generateInvoicePdf(Order order) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Colours 
        Color copper    = new Color(200, 116, 42);
        Color dark      = new Color(28, 28, 26);
        Color muted     = new Color(122, 117, 112);
        Color lightBg   = new Color(245, 240, 234);
        Color border    = new Color(200, 199, 191);

        // Fonts 
        Font brandFont  = new Font(Font.HELVETICA, 22, Font.BOLD, dark);
        Font tagline    = new Font(Font.HELVETICA, 9,  Font.ITALIC, muted);
        Font h2         = new Font(Font.HELVETICA, 14, Font.BOLD, copper);
        Font labelFont  = new Font(Font.HELVETICA, 8,  Font.BOLD, muted);
        Font bodyFont   = new Font(Font.HELVETICA, 9,  Font.NORMAL, dark);
        Font boldBody   = new Font(Font.HELVETICA, 9,  Font.BOLD, dark);
        Font tableHead  = new Font(Font.HELVETICA, 8,  Font.BOLD, dark);
        Font tableCell  = new Font(Font.HELVETICA, 9,  Font.NORMAL, dark);
        Font totalFont  = new Font(Font.HELVETICA, 13, Font.BOLD, dark);
        Font copperFont = new Font(Font.HELVETICA, 9,  Font.NORMAL, copper);

        // Header 
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{1, 1});
        header.setSpacingAfter(4);

        // Left: brand
        PdfPCell brandCell = new PdfPCell();
        brandCell.setBorder(Rectangle.NO_BORDER);
        brandCell.setPadding(0);
        Paragraph brandPara = new Paragraph("CLOTHSY", brandFont);
        brandPara.add(Chunk.NEWLINE);
        brandPara.add(new Chunk("Seasonless. Considered.", tagline));
        brandCell.addElement(brandPara);
        header.addCell(brandCell);

        // Right: invoice meta
        String dateStr = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
                : "—";
        PdfPCell metaCell = new PdfPCell();
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        metaCell.setPadding(0);
        Paragraph metaPara = new Paragraph();
        metaPara.add(new Chunk("INVOICE\n", h2));
        metaPara.add(new Chunk("INV NO: #CLS-" + order.getId() + "00\n", new Font(Font.COURIER, 8, Font.NORMAL, dark)));
        metaPara.add(new Chunk("DATE: " + dateStr, new Font(Font.COURIER, 8, Font.NORMAL, dark)));
        metaPara.setAlignment(Element.ALIGN_RIGHT);
        metaCell.addElement(metaPara);
        header.addCell(metaCell);

        doc.add(header);

        // Copper rule
        PdfPTable rule = new PdfPTable(1);
        rule.setWidthPercentage(100);
        rule.setSpacingAfter(20);
        PdfPCell ruleCell = new PdfPCell();
        ruleCell.setBackgroundColor(copper);
        ruleCell.setFixedHeight(2);
        ruleCell.setBorder(Rectangle.NO_BORDER);
        rule.addCell(ruleCell);
        doc.add(rule);

        // Bill To / Ship To 
        PdfPTable addresses = new PdfPTable(2);
        addresses.setWidthPercentage(100);
        addresses.setSpacingAfter(20);

        PdfPCell billCell = addressBlock("BILL TO",
                (order.getUser() != null ? order.getUser().getFirstName() + " " + order.getUser().getLastName() : "Customer"),
                order.getShippingAddress() != null ? List.of(
                        order.getShippingAddress().getStreetAddress(),
                        order.getShippingAddress().getCity() + ", " + order.getShippingAddress().getState(),
                        order.getShippingAddress().getZipCode(),
                        "India"
                ) : List.of(),
                labelFont, bodyFont, boldBody, lightBg, border);
        
        PdfPCell shipCell = addressBlock("SHIP TO",
                order.getShippingAddress() != null
                        ? order.getShippingAddress().getFirstName() + " " + order.getShippingAddress().getLastName()
                        : "—",
                order.getShippingAddress() != null ? List.of(
                        order.getShippingAddress().getStreetAddress(),
                        order.getShippingAddress().getCity() + ", " + order.getShippingAddress().getState(),
                        order.getShippingAddress().getZipCode(),
                        "Ph: " + order.getShippingAddress().getMobile()
                ) : List.of(),
                labelFont, bodyFont, boldBody, lightBg, border);

        addresses.addCell(billCell);
        addresses.addCell(shipCell);
        doc.add(addresses);

        // Order Meta Row 
        String shortDate = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "—";

        PdfPTable metaRow = new PdfPTable(4);
        metaRow.setWidthPercentage(100);
        metaRow.setSpacingAfter(20);

        metaRow.addCell(metaBlock("ORDER #",    "CLS-WEB-" + order.getId(), labelFont, boldBody));
        metaRow.addCell(metaBlock("DATE",        shortDate, labelFont, boldBody));
        metaRow.addCell(metaBlock("PAYMENT",     "Prepaid / Card", labelFont, boldBody));
        metaRow.addCell(metaBlock("TRACKING",    order.getTrackingNumber() != null ? order.getTrackingNumber() : "Pending", labelFont, boldBody));
        doc.add(metaRow);

        // Line Items Table 
        PdfPTable items = new PdfPTable(new float[]{0.5f, 3.5f, 1.5f, 0.8f, 0.8f, 1.2f});
        items.setWidthPercentage(100);
        items.setSpacingAfter(24);

        String[] heads = {"#", "PRODUCT", "SKU", "SIZE", "QTY", "TOTAL"};
        for (String h : heads) {
            PdfPCell c = new PdfPCell(new Phrase(h, tableHead));
            c.setBackgroundColor(lightBg);
            c.setPadding(8);
            c.setBorderColor(border);
            c.setBorderWidth(0.5f);
            if (h.equals("TOTAL")) c.setHorizontalAlignment(Element.ALIGN_RIGHT);
            items.addCell(c);
        }

        int idx = 1;
        for (OrderItem item : order.getOrderItems()) {
            String[] row = {
                "0" + idx++,
                item.getProduct() != null ? item.getProduct().getTitle() : "—",
                item.getProduct() != null ? "PRD-" + item.getProduct().getId() : "—",
                item.getSize() != null ? item.getSize().toUpperCase() : "—",
                String.valueOf(item.getQuantity()),
                "₹" + (item.getDiscountedPrice() != null ? String.format("%,d", item.getDiscountedPrice()) : "0")
            };
            for (int i = 0; i < row.length; i++) {
                PdfPCell c = new PdfPCell(new Phrase(row[i], tableCell));
                c.setPadding(10);
                c.setBorderColor(border);
                c.setBorderWidth(0.5f);
                if (i == row.length - 1) c.setHorizontalAlignment(Element.ALIGN_RIGHT);
                items.addCell(c);
            }
        }
        doc.add(items);

        // Totals 
        int itemTotal = order.getTotalDiscountedPrice() != null ? order.getTotalDiscountedPrice() : 0;
        int originalTotal = (int) order.getTotalPrice();
        int discountAmt = originalTotal - itemTotal;
        int shipping = (itemTotal > 0 && itemTotal < 2999) ? 100 : 0;
        int finalTotal = itemTotal + shipping;
        double gst = finalTotal * 0.18;

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(50);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setSpacingAfter(24);

        addTotalRow(totals, "Subtotal",     "₹" + String.format("%,d", originalTotal), bodyFont, boldBody, border, false);
        addTotalRow(totals, "Discount",     "-₹" + String.format("%,d", discountAmt),  copperFont, copperFont, border, false);
        addTotalRow(totals, "Shipping",     shipping == 0 ? "FREE" : "₹" + shipping,   bodyFont, boldBody, border, false);
        addTotalRow(totals, "GST Included", "₹" + String.format("%.2f", gst),          bodyFont, boldBody, border, false);

        // Final total row
        PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL", totalFont));
        totalLabelCell.setPadding(10);
        totalLabelCell.setBorder(Rectangle.TOP);
        totalLabelCell.setBorderColor(copper);
        totalLabelCell.setBorderWidth(1f);
        PdfPCell totalValueCell = new PdfPCell(new Phrase("₹" + String.format("%,d", finalTotal), totalFont));
        totalValueCell.setPadding(10);
        totalValueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValueCell.setBorder(Rectangle.TOP);
        totalValueCell.setBorderColor(copper);
        totalValueCell.setBorderWidth(1f);
        totals.addCell(totalLabelCell);
        totals.addCell(totalValueCell);

        doc.add(totals);

        // Status Badge 
        String statusText = "CANCELLED".equals(order.getOrderStatus()) ? "VOIDED" : "PAID";
        PdfPTable badge = new PdfPTable(1);
        badge.setWidthPercentage(20);
        badge.setHorizontalAlignment(Element.ALIGN_LEFT);
        badge.setSpacingAfter(24);
        PdfPCell badgeCell = new PdfPCell(new Phrase(statusText, new Font(Font.COURIER, 9, Font.BOLD, Color.WHITE)));
        badgeCell.setBackgroundColor(dark);
        badgeCell.setPadding(8);
        badgeCell.setBorder(Rectangle.NO_BORDER);
        badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        badge.addCell(badgeCell);
        doc.add(badge);

        // Footer 
        PdfPTable footerRule = new PdfPTable(1);
        footerRule.setWidthPercentage(100);
        footerRule.setSpacingBefore(10);
        PdfPCell footerRuleCell = new PdfPCell();
        footerRuleCell.setBackgroundColor(border);
        footerRuleCell.setFixedHeight(0.5f);
        footerRuleCell.setBorder(Rectangle.NO_BORDER);
        footerRule.addCell(footerRuleCell);
        doc.add(footerRule);

        PdfPTable footer = new PdfPTable(2);
        footer.setWidthPercentage(100);
        footer.setSpacingBefore(8);

        PdfPCell footerLeft = new PdfPCell(new Phrase("Thank you for shopping with Clothsy", new Font(Font.HELVETICA, 9, Font.ITALIC, muted)));
        footerLeft.setBorder(Rectangle.NO_BORDER);
        footerLeft.setPadding(4);

        PdfPCell footerRight = new PdfPCell(new Phrase("Returns accepted within 7 days", new Font(Font.HELVETICA, 8, Font.NORMAL, muted)));
        footerRight.setBorder(Rectangle.NO_BORDER);
        footerRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
        footerRight.setPadding(4);

        footer.addCell(footerLeft);
        footer.addCell(footerRight);
        doc.add(footer);

        PdfPTable footerMeta = new PdfPTable(2);
        footerMeta.setWidthPercentage(100);

        PdfPCell fml = new PdfPCell(new Phrase("CLOTHSY RETAIL | HYDERABAD, IN 500081", new Font(Font.COURIER, 7, Font.NORMAL, muted)));
        fml.setBorder(Rectangle.NO_BORDER);
        fml.setPadding(2);

        PdfPCell fmr = new PdfPCell(new Phrase("CONTACT: ASSISTANCE@CLOTHSY.COM", new Font(Font.COURIER, 7, Font.NORMAL, muted)));
        fmr.setBorder(Rectangle.NO_BORDER);
        fmr.setHorizontalAlignment(Element.ALIGN_RIGHT);
        fmr.setPadding(2);

        footerMeta.addCell(fml);
        footerMeta.addCell(fmr);
        doc.add(footerMeta);

        doc.close();
        return out.toByteArray();
    }

    private PdfPCell addressBlock(String label, String name, List<String> lines,
                                   Font labelFont, Font bodyFont, Font boldBody,
                                   Color bg, Color border) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(16);
        cell.setBorderColor(border);
        cell.setBorderWidth(0.5f);

        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelFont));
        p.add(new Chunk(name + "\n", boldBody));
        for (String line : lines) {
            p.add(new Chunk(line + "\n", bodyFont));
        }
        cell.addElement(p);
        return cell;
    }

    private PdfPCell metaBlock(String label, String value, Font labelFont, Font boldBody) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(8);
        Paragraph p = new Paragraph();
        p.add(new Chunk(label + "\n", labelFont));
        p.add(new Chunk(value, boldBody));
        cell.addElement(p);
        return cell;
    }

    private void addTotalRow(PdfPTable table, String label, String value,
                              Font labelFont, Font valueFont, Color border, boolean highlight) {
        PdfPCell lc = new PdfPCell(new Phrase(label, labelFont));
        lc.setPadding(6);
        lc.setBorderColor(border);
        lc.setBorderWidth(0.5f);

        PdfPCell vc = new PdfPCell(new Phrase(value, valueFont));
        vc.setPadding(6);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vc.setBorderColor(border);
        vc.setBorderWidth(0.5f);

        table.addCell(lc);
        table.addCell(vc);
    }

    // HTTP / RESEND

    private void sendResendEmail(String toEmail, String subject, String htmlContent,
                                  byte[] attachmentBytes, String attachmentName) throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("from", "CLOTHSY <onboarding@resend.dev>");
        payload.put("to", List.of(toEmail));
        payload.put("subject", subject);
        payload.put("html", htmlContent);

        if (attachmentBytes != null && attachmentName != null) {
            String base64Content = Base64.getEncoder().encodeToString(attachmentBytes);
            Map<String, String> attachment = new HashMap<>();
            attachment.put("filename", attachmentName);
            attachment.put("content", base64Content);
            payload.put("attachments", List.of(attachment));
        }

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            System.err.println("Resend API error " + response.statusCode() + ": " + response.body());
        }
    }

    // HTML EMAIL BUILDERS

    private String buildProcessingHtml(Order order) {
        String dateStr = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
                : "—";

        StringBuilder itemsHtml = new StringBuilder();
        for (OrderItem item : order.getOrderItems()) {
            itemsHtml.append("""
                <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                    <img src="%s" style="width: 80px; height: 80px; object-fit: cover;" />
                    <div>
                        <h3 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 18px; margin: 0;">%s</h3>
                        <p style="font-size: 14px; color: #7A7570; margin: 4px 0;">Size %s · Qty: %s</p>
                    </div>
                    <span style="font-family: 'Newsreader', serif; font-style: italic; font-size: 18px; margin-left: auto;">₹ %s</span>
                </div>
            """.formatted(
                item.getProduct() != null ? item.getProduct().getImageUrl() : "",
                item.getProduct() != null ? item.getProduct().getTitle() : "—",
                item.getSize(), item.getQuantity(),
                item.getDiscountedPrice() != null ? String.format("%,d", item.getDiscountedPrice()) : "0"
            ));
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin: 0;">CLOTHSY</h1>
                        <div style="width: 60px; height: 2px; background-color: #C8742A; margin: 16px auto 0;"></div>
                    </div>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 44px; text-align: center; margin-bottom: 8px;">Your order is confirmed.</h2>
                    <p style="text-align: center; color: #7A7570; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Order #%s · Placed on %s</p>
                    <p style="text-align: center; color: #7A7570; font-size: 12px; margin-bottom: 40px;">Your invoice is attached to this email as a PDF.</p>
                    <div style="background-color: #F5F0EA; padding: 32px; margin-bottom: 32px;">
                        <h2 style="font-size: 10px; font-weight: bold; letter-spacing: 0.1em; color: #C8742A; text-transform: uppercase; margin-bottom: 32px;">ORDER SUMMARY</h2>
                        %s
                        <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid rgba(200,116,42,0.2);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #7A7570; text-transform: uppercase;">
                                <span>Subtotal</span><span>₹ %s</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #7A7570; text-transform: uppercase;">
                                <span>Total</span><span style="color: #1C1C1A; font-weight: bold;">₹ %s</span>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #F5F0EA; padding: 32px; margin-bottom: 48px;">
                        <h2 style="font-size: 10px; font-weight: bold; letter-spacing: 0.1em; color: #C8742A; text-transform: uppercase; margin-bottom: 16px;">SHIPPING TO</h2>
                        <p style="font-size: 14px; line-height: 1.6; text-transform: uppercase;">
                            %s %s<br/>%s<br/>%s, %s %s
                        </p>
                    </div>
                    <a href="http://localhost:5173/account/order/%s" style="display: block; background-color: #1C1C1A; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none;">VIEW ORDER</a>
                </div>
            </body>
            </html>
            """.formatted(
                order.getId(), dateStr,
                itemsHtml.toString(),
                String.format("%,d", (int) order.getTotalPrice()),
                String.format("%,d", order.getTotalDiscountedPrice() != null ? order.getTotalDiscountedPrice() : 0),
                order.getShippingAddress() != null ? order.getShippingAddress().getFirstName() : "",
                order.getShippingAddress() != null ? order.getShippingAddress().getLastName() : "",
                order.getShippingAddress() != null ? order.getShippingAddress().getStreetAddress() : "",
                order.getShippingAddress() != null ? order.getShippingAddress().getCity() : "",
                order.getShippingAddress() != null ? order.getShippingAddress().getState() : "",
                order.getShippingAddress() != null ? order.getShippingAddress().getZipCode() : "",
                order.getId()
        );
    }

    private String buildShippedHtml(Order order) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px;">CLOTHSY</h1>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 48px; color: #3B82F6; margin-bottom: 16px;">It's on the way!</h2>
                    <p style="color: #7A7570; margin-bottom: 40px;">Your order #%s has left our facility and is heading to you.</p>
                    <div style="border-top: 1px solid #C8742A; padding-top: 24px; margin-bottom: 40px; text-align: left;">
                        <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #C8742A; text-transform: uppercase;">TRACKING DETAILS</span>
                        <div style="font-family: monospace; font-size: 32px; font-weight: bold; margin-top: 16px;">%s</div>
                    </div>
                    <a href="http://localhost:5173/account/order/%s" style="display: block; background-color: #1C1C1A; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; text-decoration: none;">TRACK YOUR SHIPMENT</a>
                </div>
            </body>
            </html>
            """.formatted(
                order.getId(),
                order.getTrackingNumber() != null ? order.getTrackingNumber() : "Pending Courier Assignment",
                order.getId()
        );
    }

    private String buildDeliveredHtml(Order order) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px;">CLOTHSY</h1>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 48px; color: #16A34A; margin-bottom: 16px;">Your order has arrived.</h2>
                    <p style="color: #7A7570; margin-bottom: 40px;">We hope you love it. You have 7 days to request a return if anything isn't right.</p>
                    <div style="background-color: #F5F0EA; padding: 32px; text-align: left; margin-bottom: 40px; border-left: 4px solid #16A34A;">
                        <p style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #C8742A; text-transform: uppercase; margin: 0;">Ref No.</p>
                        <p style="font-family: 'Newsreader', serif; font-style: italic; font-size: 24px; margin: 8px 0 0 0;">#%s</p>
                    </div>
                    <a href="http://localhost:5173/account/order/%s" style="display: inline-block; border: 1px solid #1C1C1A; color: #1C1C1A; padding: 16px 48px; font-size: 11px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;">VIEW ORDER OR START RETURN</a>
                </div>
            </body>
            </html>
            """.formatted(order.getId(), order.getId());
    }

    private String buildCancelledHtml(Order order) {
        String dateStr = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
                : "—";
        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px;">CLOTHSY</h1>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 44px; color: #DC2626; margin-bottom: 16px;">Your order has been cancelled.</h2>
                    <p style="color: #7A7570; margin-bottom: 40px;">As requested, your order #%s has been cancelled.</p>
                    <div style="background-color: #F6F3EF; border-left: 2px solid #DC2626; padding: 32px; text-align: left; margin-bottom: 40px;">
                        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 16px;">Any payments made will be refunded to your original payment method within 3–5 business days.</p>
                        <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Refund Amount: ₹%s</p>
                    </div>
                    <div style="border-top: 1px solid rgba(200,116,42,0.1); border-bottom: 1px solid rgba(200,116,42,0.1); padding: 24px 0; margin-bottom: 40px; font-size: 12px; color: #7A7570; text-transform: uppercase; letter-spacing: 2px;">
                        Order #%s | %s | ₹%s
                    </div>
                    <a href="http://localhost:5173/" style="display: block; background-color: #1C1C1A; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;">CONTINUE SHOPPING</a>
                </div>
            </body>
            </html>
            """.formatted(
                order.getId(),
                String.format("%,d", order.getTotalDiscountedPrice() != null ? order.getTotalDiscountedPrice() : 0),
                order.getId(), dateStr,
                String.format("%,d", order.getTotalDiscountedPrice() != null ? order.getTotalDiscountedPrice() : 0)
        );
    }

    private String buildReturnHtml(Order order) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin: 0;">CLOTHSY</h1>
                        <div style="width: 60px; height: 2px; background-color: #C8742A; margin: 16px auto 0;"></div>
                    </div>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 40px; color: #9333EA; text-align: center; margin-bottom: 16px;">Your return has been initiated.</h2>
                    <p style="text-align: center; color: #7A7570; margin-bottom: 40px;">We've received your request for order #%s.</p>
                    <div style="background-color: #F6F3EF; border-left: 2px solid #C8742A; padding: 32px; margin-bottom: 40px;">
                        <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #C8742A; text-transform: uppercase; display: block; margin-bottom: 16px;">PREPARE YOUR PACKAGE</span>
                        <p style="font-size: 12px; color: #544338; line-height: 1.6; margin-bottom: 8px;">✓ Ensure all original tags and security seals remain intact.</p>
                        <p style="font-size: 12px; color: #544338; line-height: 1.6; margin-bottom: 8px;">✓ The pickup agent will bring the shipping label.</p>
                        <p style="font-size: 12px; color: #544338; line-height: 1.6; margin-bottom: 0;">✓ Items must be in their original, unused condition.</p>
                    </div>
                    <a href="http://localhost:5173/returns" style="display: block; background-color: #1C1C1A; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.2em; text-transform: uppercase; text-decoration: none;">VIEW RETURN STATUS</a>
                </div>
            </body>
            </html>
            """.formatted(order.getId());
    }

    private String buildRefundHtml(Order order) {
        String dateStr = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
                : "—";
        return """
            <!DOCTYPE html>
            <html lang="en">
            <body style="background-color: #FDFAF6; color: #1C1C1A; font-family: 'Manrope', sans-serif; margin: 0; padding: 0;">
                <div style="max-width: 620px; margin: auto; padding: 40px 20px; text-align: center;">
                    <h1 style="font-size: 24px; font-family: 'Newsreader', serif; letter-spacing: 0.3em; text-transform: uppercase; margin-bottom: 40px;">CLOTHSY</h1>
                    <h2 style="font-family: 'Newsreader', serif; font-style: italic; font-size: 44px; color: #16A34A; margin-bottom: 16px;">Your refund has been issued.</h2>
                    <p style="color: #7A7570; margin-bottom: 40px;">We've successfully processed your refund for order #%s.</p>
                    <div style="background-color: #F5F0EA; border-top: 2px solid #16A34A; padding: 40px; margin-bottom: 40px;">
                        <span style="font-size: 12px; font-weight: bold; letter-spacing: 0.1em; color: #544338; text-transform: uppercase; display: block; margin-bottom: 8px;">Total Refund Amount</span>
                        <div style="font-size: 36px; font-weight: bold; color: #1C1C1A; margin-bottom: 16px;">₹%s</div>
                        <p style="font-size: 12px; color: #1C1C1A; margin: 0 0 4px 0;">Refund to original payment method</p>
                        <p style="font-family: 'Newsreader', serif; font-style: italic; font-size: 14px; color: #544338; margin: 0;">Allow 3-5 business days for this to appear in your account.</p>
                    </div>
                    <a href="http://localhost:5173/" style="display: block; background-color: #1C1C1A; color: #ffffff; text-align: center; padding: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">SHOP THE NEW ARRIVALS</a>
                </div>
            </body>
            </html>
            """.formatted(
                order.getId(),
                String.format("%,d", order.getTotalDiscountedPrice() != null ? order.getTotalDiscountedPrice() : 0)
        );
    }
}