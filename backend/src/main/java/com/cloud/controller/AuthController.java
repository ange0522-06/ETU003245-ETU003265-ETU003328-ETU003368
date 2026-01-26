package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.auth.AuthResponse;
import com.cloud.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import com.cloud.auth.LoginRequest;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        return ResponseEntity.ok(authService.register(username, password));
    }

    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @RequestBody LoginRequest request) {
            
            String token = authService.authenticate(
                request.getUsername(),
                request.getPassword()
            );
            
            return ResponseEntity.ok(new AuthResponse(token));
    }
        
        // @PostMapping("/login")
        // public ResponseEntity<User> login(@RequestBody Map<String, String> body) {
        //     String username = body.get("username");
        //     String password = body.get("password");
        //     return ResponseEntity.ok(authService.login(username, password));
        // }
}
