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
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = authService.login(request.getEmail(), request.getPassword());
        String token = authService.authenticate(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole()));
    }

}
