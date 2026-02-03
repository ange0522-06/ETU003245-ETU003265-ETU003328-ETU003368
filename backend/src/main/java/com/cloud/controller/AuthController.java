package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.auth.AuthResponse;
import com.cloud.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.cloud.auth.LoginRequest;
import com.cloud.dto.RegisterRequest;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request.getEmail(), request.getPassword(), request.getRole());
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // AuthService renvoie un objet LoginResult (voir ci-dessous)
            AuthService.LoginResult result = authService.tryLogin(request.getEmail(), request.getPassword());
            if (result.isSuccess()) {
                return ResponseEntity.ok(new AuthResponse(result.getToken(), result.getRole()));
            } else if (result.isLocked()) {
                return ResponseEntity.status(403).body("locked");
            } else {
                // Message d'échec avec nombre de tentatives
                return ResponseEntity.status(403).body("failed attempts: " + result.getFailedAttempts());
            }
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

}
