package com.invoiceapp.service;

import com.invoiceapp.entity.Invoice;
import com.invoiceapp.entity.InvoiceItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class PdfService {

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // 1. Invoice Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Color.BLACK);
            Paragraph title = new Paragraph("INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_RIGHT);
            document.add(title);

            document.add(new Paragraph("Invoice #: " + invoice.getInvoiceNumber()));
            document.add(new Paragraph("Issue Date: " + invoice.getIssueDate()));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate()));
            document.add(Chunk.NEWLINE);

            // 2. Customer Details
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            document.add(new Paragraph("Bill To:", sectionFont));
            document.add(new Paragraph(invoice.getCustomer().getName()));
            document.add(new Paragraph(invoice.getCustomer().getEmail()));
            if (invoice.getCustomer().getAddress() != null) {
                document.add(new Paragraph(invoice.getCustomer().getAddress()));
            }
            document.add(Chunk.NEWLINE);

            // 3. Line Items Table
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4f, 1f, 2f, 2f}); // Column widths

            // Table Headers
            String[] headers = {"Description", "Qty", "Unit Price", "Total"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, sectionFont));
                cell.setBackgroundColor(new Color(240, 240, 240));
                cell.setPadding(8);
                table.addCell(cell);
            }

            // Table Rows
            for (InvoiceItem item : invoice.getItems()) {
                table.addCell(new PdfPCell(new Phrase(item.getDescription())));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()))));
                table.addCell(new PdfPCell(new Phrase("$" + item.getPrice().toString())));

                BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                table.addCell(new PdfPCell(new Phrase("$" + lineTotal.toString())));
            }
            document.add(table);
            document.add(Chunk.NEWLINE);

            // 4. Grand Total
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLACK);
            Paragraph total = new Paragraph("Total Amount: $" + invoice.getTotalAmount(), totalFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }

        return baos.toByteArray();
    }
}