package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.auth.AuthResponse;
import com.cloud.security.JwtService;
import com.cloud.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    
    public UserController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Token manquant ou invalide");
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractUsername(token);
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user != null) {
                    return ResponseEntity.ok(new AuthResponse.UserInfo(user));
                }
            }
            
            return ResponseEntity.status(401).body("Token invalide ou utilisateur non trouvé");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de la récupération des informations utilisateur");
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    @GetMapping("/locked")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public List<User> getLockedUsers() {
        return userRepository.findByLockedTrue();
    }
}
