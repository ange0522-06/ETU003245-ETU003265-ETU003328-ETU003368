package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.auth.AuthResponse;
import com.cloud.service.AuthService;
import com.cloud.service.FirebaseAuthService;
import com.cloud.security.JwtService;
import com.cloud.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import com.cloud.auth.LoginRequest;
import com.cloud.dto.RegisterRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final FirebaseAuthService firebaseAuthService;

    public AuthController(AuthService authService, UserRepository userRepository, 
                         JwtService jwtService, FirebaseAuthService firebaseAuthService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.firebaseAuthService = firebaseAuthService;
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
            // AuthService renvoie un objet LoginResult 
            AuthService.LoginResult result = authService.tryLogin(request.getEmail(), request.getPassword());
            if (result.isSuccess()) {
                // Récupérer les données complètes de l'utilisateur
                User user = userRepository.findByEmail(request.getEmail()).orElse(null);
                if (user != null) {
                    return ResponseEntity.ok(new AuthResponse(result.getToken(), user));
                } else {
                    return ResponseEntity.status(500).body(new AuthResponse("Erreur lors de la récupération des données utilisateur"));
                }
            } else if (result.isLocked()) {
                return ResponseEntity.status(403).body(new AuthResponse("Compte verrouillé suite à trop de tentatives de connexion"));
            } else {
                // Message d'échec avec nombre de tentatives
                return ResponseEntity.status(403).body(new AuthResponse("Email ou mot de passe incorrect (tentatives: " + result.getFailedAttempts() + ")"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new AuthResponse("Erreur du serveur: " + e.getMessage()));
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Token manquant ou invalide"));
            }
            
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            
            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractUsername(token);
                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user != null && !user.isLocked()) {
                    return ResponseEntity.ok(Map.of(
                        "valid", true, 
                        "user", new AuthResponse.UserInfo(user)
                    ));
                }
            }
            
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Token expiré ou utilisateur non trouvé"));
            
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "message", "Erreur lors de la validation du token"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Avec JWT, le logout est généralement géré côté client
        // Ici on renvoie juste une confirmation
        return ResponseEntity.ok(Map.of("success", true, "message", "Déconnexion réussie"));
    }

    @GetMapping("/check-manager")
    public ResponseEntity<Map<String, Boolean>> checkManagerExists() {
        boolean exists = userRepository.existsByRoleIgnoreCase("manager");
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    @PostMapping("/sync-users-to-firebase")
    public ResponseEntity<Map<String, Object>> syncUsersToFirebase() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            // Filtrer seulement les utilisateurs éligibles (rôle "user")
            List<User> eligibleUsers = allUsers.stream()
                .filter(User::isEligibleForFirebaseSync)
                .toList();
                
            int syncedCount = firebaseAuthService.syncAllUsersToFirebase(allUsers);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Synchronisation terminée",
                "totalUsers", allUsers.size(),
                "eligibleUsers", eligibleUsers.size(),
                "syncedUsers", syncedCount,
                "syncRate", eligibleUsers.size() > 0 ? 
                    Math.round((syncedCount * 100.0 / eligibleUsers.size())) + "%" : "0%"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la synchronisation: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/firebase-sync-status")
    public ResponseEntity<Map<String, Object>> getFirebaseSyncStatus() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            long totalUsers = allUsers.size();
            long eligibleUsers = allUsers.stream().filter(User::isEligibleForFirebaseSync).count();
            long syncedUsers = allUsers.stream().filter(User::isFirebaseSynced).count();
            long pendingUsers = allUsers.stream()
                .filter(user -> user.isEligibleForFirebaseSync() && !user.isFirebaseSynced())
                .count();
            long errorUsers = allUsers.stream()
                .filter(user -> "SYNC_ERROR".equals(user.getSyncStatus()))
                .count();
                
            // Détails des utilisateurs par catégorie
            List<Map<String, Object>> userDetails = allUsers.stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("role", user.getRole() != null ? user.getRole() : "NULL");
                    userMap.put("firebaseUid", user.getFirebaseUid() != null ? user.getFirebaseUid() : "null");
                    userMap.put("syncStatus", user.getSyncStatus());
                    userMap.put("syncedAt", user.getFirebaseSyncedAt() != null ? user.getFirebaseSyncedAt().toString() : "null");
                    userMap.put("eligible", user.isEligibleForFirebaseSync());
                    userMap.put("synced", user.isFirebaseSynced());
                    return userMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", Map.of(
                    "totalUsers", totalUsers,
                    "eligibleUsers", eligibleUsers,
                    "syncedUsers", syncedUsers,
                    "pendingUsers", pendingUsers,
                    "errorUsers", errorUsers,
                    "syncPercentage", eligibleUsers > 0 ? Math.round((syncedUsers * 100.0 / eligibleUsers)) : 0
                ),
                "userDetails", userDetails,
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la récupération du statut: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/sync-user-to-firebase/{userId}")
    public ResponseEntity<Map<String, Object>> syncSingleUserToFirebase(
            @PathVariable Long userId, 
            @RequestBody Map<String, String> request) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
                
            String plainPassword = request.get("password");
            if (plainPassword == null || plainPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Mot de passe requis pour la synchronisation"
                ));
            }
            
            String uid = firebaseAuthService.syncUserToFirebase(user, plainPassword);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Utilisateur synchronisé avec succès",
                "firebaseUid", uid
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la synchronisation: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Re-synchroniser le mot de passe d'un utilisateur vers Firebase
     * L'utilisateur fournit son email et mot de passe actuel, qui est vérifié 
     * contre PostgreSQL puis mis à jour dans Firebase
     */
    @PostMapping("/resync-firebase-password")
    public ResponseEntity<Map<String, Object>> resyncFirebasePassword(@RequestBody LoginRequest request) {
        try {
            // 1. Trouver l'utilisateur dans PostgreSQL
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            // 2. Vérifier que le mot de passe fourni correspond à celui en base
            org.springframework.security.crypto.password.PasswordEncoder encoder = 
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
            
            if (!encoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Mot de passe incorrect"
                ));
            }
            
            // 3. Vérifier l'éligibilité pour Firebase
            if (!user.isEligibleForFirebaseSync()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cet utilisateur n'est pas éligible pour la synchronisation Firebase (rôle: " + user.getRole() + ")"
                ));
            }
            
            // 4. Synchroniser vers Firebase avec le mot de passe vérifié
            String uid = firebaseAuthService.syncUserToFirebase(user, request.getPassword());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mot de passe Firebase mis à jour avec succès. Vous pouvez maintenant vous connecter sur l'application mobile.",
                "firebaseUid", uid
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la synchronisation: " + e.getMessage()
            ));
        }
    }

}
