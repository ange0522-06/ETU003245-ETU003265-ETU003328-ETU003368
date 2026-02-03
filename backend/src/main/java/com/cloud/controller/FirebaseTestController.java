package com.cloud.controller;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.cloud.service.FirebaseAuthService;
import com.cloud.service.FireStoreService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class FirebaseTestController {
    private static final Logger log = LoggerFactory.getLogger(FirebaseTestController.class);
    
    private final FirebaseAuthService firebaseAuthService;
    private final FireStoreService firestoreService;
    
    @GetMapping("/firebase/status")
    public ResponseEntity<Map<String, Object>> getFirebaseStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Test Firebase App
            FirebaseApp app = FirebaseApp.getInstance();
            
            response.put("status", "CONNECTED");
            response.put("projectId", app.getOptions().getProjectId());
            response.put("databaseUrl", app.getOptions().getDatabaseUrl());
            
            // Essayer de récupérer l'email du service account via une méthode alternative
            try {
                // Tester une opération simple pour vérifier les permissions
                FirebaseAuth.getInstance(app).listUsers(null);
                response.put("serviceAccount", "PERMISSIONS_OK");
            } catch (Exception e) {
                response.put("serviceAccount", "LIMITED_ACCESS");
            }
            
            // Test Firebase Auth
            boolean authAvailable = firebaseAuthService.isFirebaseAvailable();
            response.put("firebaseAuth", authAvailable ? "AVAILABLE" : "UNAVAILABLE");
            
            // Test Firestore
            boolean firestoreAvailable = firestoreService.isFirestoreAvailable();
            response.put("firestore", firestoreAvailable ? "AVAILABLE" : "UNAVAILABLE");
            
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "DISCONNECTED");
            response.put("error", e.getMessage());
            return ResponseEntity.status(503).body(response);
        }
    }
    
    @PostMapping("/firebase/create-test-user")
    public ResponseEntity<Map<String, Object>> createTestUser() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String testEmail = "test-" + System.currentTimeMillis() + "@gestion-routiere.com";
            String password = "Test123!";
            
            // Créer l'utilisateur dans Firebase Auth
            UserRecord userRecord = firebaseAuthService.createUser(
                testEmail, 
                password, 
                "Test User Spring Boot"
            );
            
            // Sauvegarder dans Firestore
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", userRecord.getEmail());
            userData.put("displayName", userRecord.getDisplayName());
            userData.put("createdVia", "Spring Boot Test");
            userData.put("test", true);
            
            firestoreService.saveUserToFirestore(userRecord.getUid(), userData);
            
            response.put("success", true);
            response.put("message", "Utilisateur test créé avec succès");
            response.put("userId", userRecord.getUid());
            response.put("email", userRecord.getEmail());
            response.put("displayName", userRecord.getDisplayName());
            
            return ResponseEntity.ok(response);
            
        } catch (FirebaseAuthException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("errorCode", e.getErrorCode());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @GetMapping("/firebase/list-users")
    public ResponseEntity<Map<String, Object>> listUsers() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Simuler un test de connexion
            FirebaseAuth.getInstance().listUsers(null);
            
            response.put("success", true);
            response.put("message", "Connexion Firebase Auth fonctionnelle");
            response.put("canListUsers", true);
            
            return ResponseEntity.ok(response);
            
        } catch (FirebaseAuthException e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("canListUsers", false);
            return ResponseEntity.status(503).body(response);
        }
    }

    @GetMapping("/firebase/users")
    public ResponseEntity<Object> getFirebaseUsers() {
        try {
            List<Map<String, Object>> users = firebaseAuthService.listAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching Firebase users", e);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("error", e.getMessage());
            // add simple stack trace for local debugging
            StringBuilder st = new StringBuilder();
            for (StackTraceElement el : e.getStackTrace()) {
                st.append(el.toString()).append("\n");
            }
            resp.put("stack", st.toString());
            return ResponseEntity.status(500).body(resp);
        }
    }
    
    @GetMapping("/firebase/check-firestore")
    public ResponseEntity<Map<String, Object>> checkFirestore() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Créer un document test
            Map<String, Object> testData = new HashMap<>();
            testData.put("test", "firestore_connection");
            testData.put("timestamp", System.currentTimeMillis());
            testData.put("application", "gestion-routiere");
            
            String docId = "test-" + System.currentTimeMillis();
            firestoreService.saveRoute(docId, testData);
            
            // Lire le document
            Map<String, Object> savedData = firestoreService.getUserFromFirestore(docId);
            
            response.put("success", true);
            response.put("message", "Firestore opérationnel");
            response.put("documentId", docId);
            response.put("dataSaved", testData);
            response.put("dataRetrieved", savedData != null ? savedData : "null");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(503).body(response);
        }
    }
    
    @GetMapping("/firebase/simple-test")
    public ResponseEntity<Map<String, Object>> simpleTest() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            FirebaseApp app = FirebaseApp.getInstance();
            response.put("status", "OK");
            response.put("project", app.getOptions().getProjectId());
            response.put("firebaseVersion", "9.x");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}