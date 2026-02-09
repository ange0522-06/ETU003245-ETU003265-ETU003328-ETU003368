package com.cloud;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.cloud.service.FirebaseAuthService;
import com.cloud.service.FireStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

//@Component
@RequiredArgsConstructor
@Slf4j
public class TestConnexionFirebase implements CommandLineRunner {
    
    private final FirebaseAuthService firebaseAuthService;
    private final FireStoreService firestoreService;
    
    @Override
    public void run(String... args) throws Exception {
        log.info("🧪 ========== TEST DE CONNEXION FIREBASE ==========");
        
        try {
            // 1. Test Firebase Auth
            boolean isFirebaseAvailable = firebaseAuthService.isFirebaseAvailable();
            
            if (isFirebaseAvailable) {
                log.info("✅ FIREBASE AUTH - CONNECTÉ");
                
                // Récupérer l'instance Firebase
                FirebaseApp app = FirebaseApp.getInstance();
                log.info("📋 Projet ID: {}", app.getOptions().getProjectId());
                log.info("🔗 Database URL: {}", app.getOptions().getDatabaseUrl());
                
                // Récupérer l'email du service account (méthode alternative)
                try {
                    // Essayer de lister les utilisateurs pour vérifier la connexion
                    FirebaseAuth.getInstance(app).listUsers(null);
                    log.info("👤 Connexion Firebase Auth vérifiée");
                } catch (Exception e) {
                    log.warn("⚠️ Connexion limitée: {}", e.getMessage());
                }
                
            } else {
                log.warn("⚠️ FIREBASE AUTH - NON DISPONIBLE");
                log.info("📋 Le mode local PostgreSQL sera utilisé");
            }
            
            // 2. Test Firestore
            boolean isFirestoreAvailable = firestoreService.isFirestoreAvailable();
            
            if (isFirestoreAvailable) {
                log.info("✅ FIRESTORE - CONNECTÉ");
                
                // Créer un document test dans Firestore
                Map<String, Object> testData = new HashMap<>();
                testData.put("test", "connexion_firestore");
                testData.put("timestamp", System.currentTimeMillis());
                testData.put("application", "gestion-routiere");
                
                try {
                    firestoreService.saveRoute("test-connexion", testData);
                    log.info("📝 Document test créé dans Firestore");
                } catch (Exception e) {
                    log.warn("⚠️ Impossible d'écrire dans Firestore: {}", e.getMessage());
                }
                
            } else {
                log.warn("⚠️ FIRESTORE - NON DISPONIBLE");
            }
            
            log.info("🧪 ========== TEST TERMINÉ ==========");
            
        } catch (Exception e) {
            log.error("❌ ERREUR CRITIQUE: {}", e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void createTestUser() {
        try {
            // Tester la création d'un utilisateur (optionnel)
            String testEmail = "test-" + System.currentTimeMillis() + "@gestion-routiere.com";
            
            com.google.firebase.auth.UserRecord userRecord = 
                firebaseAuthService.createUser(testEmail, "Test123!", "Utilisateur Test");
            
            log.info("👤 Utilisateur test créé: {} (UID: {})", 
                     userRecord.getEmail(), userRecord.getUid());
            
            // Sauvegarder dans Firestore
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", userRecord.getEmail());
            userData.put("displayName", userRecord.getDisplayName());
            userData.put("testUser", true);
            
            firestoreService.saveUserToFirestore(userRecord.getUid(), userData);
            
        } catch (Exception e) {
            log.warn("⚠️ Création d'utilisateur test échouée: {}", e.getMessage());
        }
    }
}