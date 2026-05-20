package com.invoiceapp.controller;

import com.invoiceapp.dto.InvoiceRequest;
import com.invoiceapp.entity.Customer;
import com.invoiceapp.entity.Invoice;
import com.invoiceapp.entity.InvoiceItem;
import com.invoiceapp.entity.User;
import com.invoiceapp.repository.CustomerRepository;
import com.invoiceapp.repository.InvoiceRepository;
import com.invoiceapp.repository.UserRepository;
import com.invoiceapp.security.UserDetailsImpl;
import com.invoiceapp.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PdfService pdfService;

    public InvoiceController(InvoiceRepository invoiceRepository, CustomerRepository customerRepository,
                             UserRepository userRepository, PdfService pdfService) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.pdfService = pdfService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        List<Invoice> invoices = invoiceRepository.findByUserId(userId);

        long totalInvoices = invoices.size();
        long totalCustomers = customerRepository.findByUserId(userId).size();

        // Dynamically calculate revenue from PAID invoices
        BigDecimal totalRevenue = invoices.stream()
                .filter(i -> "Paid".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Dynamically calculate OVERDUE amounts
        BigDecimal overdueAmount = invoices.stream()
                .filter(i -> "Overdue".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group statuses for the Pie Chart
        List<Map<String, Object>> statusBreakdown = new ArrayList<>();
        Map<String, Long> counts = invoices.stream()
                .collect(Collectors.groupingBy(Invoice::getStatus, Collectors.counting()));

        counts.forEach((status, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", status);
            map.put("value", count);
            statusBreakdown.add(map);
        });

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInvoices", totalInvoices);
        stats.put("totalCustomers", totalCustomers);
        stats.put("totalRevenue", totalRevenue);
        stats.put("overdueAmount", overdueAmount);
        stats.put("statusBreakdown", statusBreakdown);

        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<?> getAllInvoices(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(invoiceRepository.findByUserId(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createInvoice(@RequestBody InvoiceRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (!customer.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setStatus("Sent");
        invoice.setCustomer(customer);
        invoice.setUser(user);

        BigDecimal total = BigDecimal.ZERO;
        for (InvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(itemReq.getPrice());

            invoice.addItem(item);
            total = total.add(itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }
        invoice.setTotalAmount(total);

        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", invoice.getInvoiceNumber() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<?> markInvoiceAsPaid(@PathVariable Long id, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        invoice.setStatus("Paid");
        return ResponseEntity.ok(invoiceRepository.save(invoice));
    }
}