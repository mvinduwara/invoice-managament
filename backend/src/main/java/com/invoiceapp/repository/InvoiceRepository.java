package com.invoiceapp.repository;

import com.invoiceapp.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByUserId(Long userId);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status")
    long countByUserIdAndStatus(Long userId, String status);
}