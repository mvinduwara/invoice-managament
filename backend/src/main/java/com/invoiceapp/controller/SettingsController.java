package com.invoiceapp.controller;

import com.invoiceapp.entity.User;
import com.invoiceapp.repository.UserRepository;
import com.invoiceapp.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UserRepository userRepository;

    public SettingsController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> payload, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        user.setBusinessName(payload.get("businessName"));
        user.setBusinessAddress(payload.get("businessAddress"));
        userRepository.save(user);

        return ResponseEntity.ok("Settings updated");
    }
}