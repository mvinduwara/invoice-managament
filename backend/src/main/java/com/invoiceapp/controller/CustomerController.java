package com.invoiceapp.controller;

import com.invoiceapp.entity.Customer;
import com.invoiceapp.entity.User;
import com.invoiceapp.repository.CustomerRepository;
import com.invoiceapp.repository.UserRepository;
import com.invoiceapp.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerController(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(customerRepository.findByUserId(userDetails.getId()));
    }

    // Quick endpoint to create a test customer
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        customer.setUser(user);
        return ResponseEntity.ok(customerRepository.save(customer));
    }
}