package com.invoiceapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", 0);
        stats.put("invoicesPaid", 0);
        stats.put("pendingAmount", 0);
        stats.put("activeCustomers", 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        return ResponseEntity.ok(Collections.emptyList());
    }
}