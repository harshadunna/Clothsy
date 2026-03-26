package org.harsha.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.harsha.backend.model.Order;
import org.harsha.backend.model.OrderItem;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Order order) throws DocumentException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // Add some margin to the document to make it breathe like a real letter
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        PdfWriter.getInstance(document, baos);

        document.open();

        // ── 1. Color Palette & Fonts ──
        Color brandOrange = new Color(200, 116, 42); // #c8742a
        Color darkText = new Color(26, 17, 9);       // #1a1109
        Color lightGray = new Color(232, 221, 213);  // #e8ddd5 border color

        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, brandOrange);
        Font invoiceTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, darkText);
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

        // ── 2. Top Header (Logo & Invoice Label) ──
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 1});

        // Left: Brand Name
        PdfPCell brandCell = new PdfPCell(new Phrase("Clothsy", brandFont));
        brandCell.setBorder(Rectangle.NO_BORDER);
        brandCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(brandCell);

        // Right: TAX INVOICE label
        PdfPCell titleCell = new PdfPCell(new Phrase("TAX INVOICE", invoiceTitleFont));
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        headerTable.addCell(titleCell);

        document.add(headerTable);
        document.add(new Paragraph("\n"));

        // ── 3. Address & Meta Information Section ──
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{1, 1});

        // Left: Company Details
        String companyDetails = "Clothsy Retail Pvt. Ltd.\n123 Fashion Avenue, Tech Park\nHyderabad, IN 500081\nGSTIN: 36AAAAA1234A1Z5\nEmail: support@clothsy.com";
        PdfPCell companyCell = new PdfPCell(new Phrase(companyDetails, normalFont));
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setPaddingBottom(20);
        infoTable.addCell(companyCell);

        // Right: Invoice Meta Data
        String invoiceMeta = String.format("Invoice No: CLO-%d\nOrder Date: %s\nOrder Status: %s\nPayment Method: Card / Prepaid",
                order.getId(),
                order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")),
                order.getOrderStatus());
        PdfPCell metaCell = new PdfPCell(new Phrase(invoiceMeta, normalFont));
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        infoTable.addCell(metaCell);

        // Span row for Billing Details
        PdfPCell billToLabel = new PdfPCell(new Phrase("BILLED & SHIPPED TO:", boldFont));
        billToLabel.setBorder(Rectangle.NO_BORDER);
        billToLabel.setColspan(2);
        billToLabel.setPaddingTop(10);
        infoTable.addCell(billToLabel);

        String customerDetails = String.format("%s %s\n%s\n%s, %s - %s\nPhone: %s",
                order.getShippingAddress().getFirstName(), order.getShippingAddress().getLastName(),
                order.getShippingAddress().getStreetAddress(),
                order.getShippingAddress().getCity(), order.getShippingAddress().getState(), order.getShippingAddress().getZipCode(),
                order.getShippingAddress().getMobile());

        PdfPCell customerCell = new PdfPCell(new Phrase(customerDetails, normalFont));
        customerCell.setBorder(Rectangle.NO_BORDER);
        customerCell.setColspan(2);
        customerCell.setPaddingBottom(20);
        infoTable.addCell(customerCell);

        document.add(infoTable);

        // ── 4. Line Items Table ──
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.8f, 4.2f, 1.5f, 2f, 2f}); // Adjusted widths

        // Table Headers
        String[] headers = {"#", "Item Description", "Qty", "Unit Price", "Total"};
        int[] alignments = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

        for (int i = 0; i < headers.length; i++) {
            PdfPCell cell = new PdfPCell(new Phrase(headers[i], tableHeaderFont));
            cell.setBackgroundColor(darkText); // Black header background
            cell.setPaddingTop(8);
            cell.setPaddingBottom(8);
            cell.setHorizontalAlignment(alignments[i]);
            cell.setBorderColor(darkText);
            table.addCell(cell);
        }

        // Table Rows
        int index = 1;
        for (OrderItem item : order.getOrderItems()) {
            double itemTotal = (double) item.getDiscountedPrice();
            double unitPrice = itemTotal / (double) item.getQuantity();

            PdfPCell[] cells = new PdfPCell[5];
            cells[0] = new PdfPCell(new Phrase(String.valueOf(index++), normalFont));

            // Description includes Brand, Title, and Size
            String description = String.format("%s\n%s (Size: %s)", item.getProduct().getBrand(), item.getProduct().getTitle(), item.getSize());
            cells[1] = new PdfPCell(new Phrase(description, normalFont));

            cells[2] = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
            cells[3] = new PdfPCell(new Phrase(String.format("Rs. %.2f", unitPrice), normalFont));
            cells[4] = new PdfPCell(new Phrase(String.format("Rs. %.2f", itemTotal), boldFont));

            for (int i = 0; i < cells.length; i++) {
                cells[i].setPaddingTop(10);
                cells[i].setPaddingBottom(10);
                cells[i].setBorderColor(lightGray);
                cells[i].setBorderWidthLeft(0);
                cells[i].setBorderWidthRight(0);
                cells[i].setHorizontalAlignment(alignments[i]);
                table.addCell(cells[i]);
            }
        }
        document.add(table);
        document.add(new Paragraph("\n"));

        // ── 5. Financial Summary (Right Aligned) ──
        double subtotal = (double) order.getTotalPrice();
        double totalPaid = (double) order.getTotalDiscountedPrice();
        double discount = subtotal - totalPaid;

        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summaryTable.setWidthPercentage(40);
        summaryTable.setWidths(new float[]{1, 1});

        // Helper to add summary rows
        addSummaryRow(summaryTable, "Subtotal:", String.format("Rs. %.2f", subtotal), normalFont);
        addSummaryRow(summaryTable, "Discount:", String.format("- Rs. %.2f", discount), normalFont);

        // Grand Total Row (Bold & Highlighted)
        PdfPCell totalLabelCell = new PdfPCell(new Phrase("Grand Total:", boldFont));
        totalLabelCell.setBorder(Rectangle.TOP);
        totalLabelCell.setBorderColor(darkText);
        totalLabelCell.setPaddingTop(8);
        summaryTable.addCell(totalLabelCell);

        PdfPCell totalValueCell = new PdfPCell(new Phrase(String.format("Rs. %.2f", totalPaid), boldFont));
        totalValueCell.setBorder(Rectangle.TOP);
        totalValueCell.setBorderColor(darkText);
        totalValueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalValueCell.setPaddingTop(8);
        summaryTable.addCell(totalValueCell);

        document.add(summaryTable);

        // ── 6. Footer ──
        document.add(new Paragraph("\n\n\n")); // Push footer down

        PdfPTable footerTable = new PdfPTable(1);
        footerTable.setWidthPercentage(100);
        PdfPCell footerCell = new PdfPCell(new Phrase("Thank you for shopping with Clothsy!\nReturns are accepted within 7 days of delivery. For support, visit www.clothsy.com/support.", smallFont));
        footerCell.setBorder(Rectangle.TOP);
        footerCell.setBorderColor(lightGray);
        footerCell.setPaddingTop(10);
        footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        footerTable.addCell(footerCell);

        document.add(footerTable);

        document.close();
        return baos.toByteArray();
    }

    // Small helper method to keep the summary section clean
    private void addSummaryRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPaddingBottom(5);
        table.addCell(valueCell);
    }
}