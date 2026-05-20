package com.invoiceapp.dto;
public record JwtResponse(String token, Long id, String username, String email) {}