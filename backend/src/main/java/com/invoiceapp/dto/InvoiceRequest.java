package com.invoiceapp.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InvoiceRequest {
    private Long customerId;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private List<InvoiceItemRequest> items;

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public List<InvoiceItemRequest> getItems() { return items; }
    public void setItems(List<InvoiceItemRequest> items) { this.items = items; }

    public static class InvoiceItemRequest {
        private String description;
        private Integer quantity;
        private BigDecimal price;

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
    }
}