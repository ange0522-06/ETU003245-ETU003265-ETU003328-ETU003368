package com.cloud.controller;

import com.cloud.model.Signalement;
import com.cloud.service.FireStoreService;
import com.cloud.service.SignalementService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/firebase")
@RequiredArgsConstructor
public class FirebaseController {
    
    private static final Logger log = LoggerFactory.getLogger(FirebaseController.class);
    
    private final FireStoreService fireStoreService;
    private final SignalementService signalementService;

    /**
     * Endpoint pour synchroniser tous les signalements SQL vers Firestore
     * Accessible uniquement aux MANAGERS
     */
    @PostMapping("/signalements/sync")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> syncSignalementsToFirebase() {
        try {
            log.info("🔄 Début de la synchronisation vers Firestore...");
            
            // Vérifier la disponibilité de Firestore
            if (!fireStoreService.isFirestoreAvailable()) {
                log.error("❌ Firestore n'est pas disponible");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                        "success", false,
                        "message", "Firestore n'est pas disponible. Vérifiez la configuration Firebase."
                    ));
            }
            
            // Récupérer tous les signalements depuis la base SQL
            List<Signalement> signalements = signalementService.getAllSignalements();
            log.info("📊 {} signalements trouvés dans la base SQL", signalements.size());
            
            if (signalements.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Aucun signalement à synchroniser",
                    "exportedCount", 0
                ));
            }
            
            // Exporter vers Firestore
            int exportedCount = fireStoreService.saveAllSignalementsToFirestore(signalements);
            
            log.info("✅ Synchronisation terminée : {} signalements exportés vers Firestore", exportedCount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Synchronisation réussie vers Firestore",
                "exportedCount", exportedCount,
                "totalSignalements", signalements.size()
            ));
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la synchronisation vers Firestore", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Erreur lors de la synchronisation : " + e.getMessage(),
                    "error", e.getClass().getSimpleName()
                ));
        }
    }

    /**
     * Endpoint pour récupérer tous les signalements depuis Firestore
     * Accessible uniquement aux MANAGERS
     */
    @GetMapping("/signalements")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> getSignalementsFromFirebase() {
        try {
            log.info("📥 Récupération des signalements depuis Firestore...");
            
            // Vérifier la disponibilité de Firestore
            if (!fireStoreService.isFirestoreAvailable()) {
                log.error("❌ Firestore n'est pas disponible");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                        "success", false,
                        "message", "Firestore n'est pas disponible. Vérifiez la configuration Firebase."
                    ));
            }
            
            // Récupérer les signalements depuis Firestore
            List<Map<String, Object>> signalements = fireStoreService.getAllSignalementsFromFirestore();
            
            log.info("✅ {} signalements récupérés depuis Firestore", signalements.size());
            
            return ResponseEntity.ok(signalements);
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération depuis Firestore", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Erreur lors de la récupération : " + e.getMessage(),
                    "error", e.getClass().getSimpleName()
                ));
        }
    }

    /**
     * Endpoint de test pour vérifier la connexion à Firestore
     */
    @GetMapping("/test")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> testFirestoreConnection() {
        try {
            boolean isAvailable = fireStoreService.isFirestoreAvailable();
            
            if (isAvailable) {
                log.info("✅ Connexion Firestore OK");
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Firestore est disponible et opérationnel",
                    "firestoreAvailable", true
                ));
            } else {
                log.warn("⚠️ Firestore n'est pas disponible");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                        "success", false,
                        "message", "Firestore n'est pas disponible",
                        "firestoreAvailable", false
                    ));
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors du test de connexion Firestore", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Erreur lors du test : " + e.getMessage(),
                    "firestoreAvailable", false
                ));
        }
    }

    /**
     * Endpoint pour obtenir le statut de Firebase/Firestore
     */
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> getFirebaseStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            boolean firestoreAvailable = fireStoreService.isFirestoreAvailable();
            
            status.put("firestoreAvailable", firestoreAvailable);
            status.put("message", firestoreAvailable ? 
                "Firebase Firestore est opérationnel" : 
                "Firebase Firestore n'est pas disponible");
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("Erreur lors de la vérification du statut Firebase", e);
            status.put("firestoreAvailable", false);
            status.put("message", "Erreur : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(status);
        }
    }
}