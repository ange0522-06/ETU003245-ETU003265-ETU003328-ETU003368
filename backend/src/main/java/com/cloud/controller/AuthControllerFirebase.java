package com.cloud.controller;

import com.cloud.dto.LoginRequest;
import com.cloud.dto.RegisterRequest;
import com.cloud.service.FirebaseAuthService;
import com.google.firebase.auth.UserRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/firebase")
public class AuthControllerFirebase {

    private final FirebaseAuthService firebaseAuthService;

    public AuthControllerFirebase(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }

    // INSCRIPTION
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserRecord user = firebaseAuthService.register(
                    request.getEmail(),
                    request.getPassword()
            );

            return ResponseEntity.ok("Utilisateur créé : " + user.getUid());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // LOGIN (via token Firebase)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String uid = firebaseAuthService.verifyToken(request.getIdToken());
            return ResponseEntity.ok("Connexion réussie UID = " + uid);

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Token invalide");
        }
    }
}
