package com.cloud.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.FirebaseApp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FireStoreService {
    
    private final FirebaseApp firebaseApp;
    
    /**
     * Obtenir l'instance Firestore
     */
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore(firebaseApp);
    }
    
    /**
     * Sauvegarder un utilisateur dans Firestore
     */
    public void saveUserToFirestore(String uid, Map<String, Object> userData) 
            throws ExecutionException, InterruptedException {
        
        Firestore db = getFirestore();
        
        // Ajouter des métadonnées
        userData.put("createdAt", FieldValue.serverTimestamp());
        userData.put("updatedAt", FieldValue.serverTimestamp());
        
        ApiFuture<WriteResult> future = db.collection("users")
            .document(uid)
            .set(userData);
        
        WriteResult result = future.get();
        log.info("Utilisateur sauvegardé dans Firestore (UID: {}) à: {}", 
                 uid, result.getUpdateTime());
    }
    
    /**
     * Récupérer un utilisateur depuis Firestore
     */
    public Map<String, Object> getUserFromFirestore(String uid) 
            throws ExecutionException, InterruptedException {
        
        Firestore db = getFirestore();
        DocumentReference docRef = db.collection("users").document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            log.info("Utilisateur trouvé dans Firestore: {}", uid);
            Map<String, Object> data = document.getData();
            data.put("id", document.getId());
            return data;
        } else {
            log.warn("Utilisateur non trouvé dans Firestore: {}", uid);
            return null;
        }
    }
    
    /**
     * Sauvegarder une route dans Firestore
     */
    public void saveRoute(String routeId, Map<String, Object> routeData) 
            throws ExecutionException, InterruptedException {
        
        Firestore db = getFirestore();
        
        routeData.put("createdAt", FieldValue.serverTimestamp());
        routeData.put("updatedAt", FieldValue.serverTimestamp());
        
        ApiFuture<WriteResult> future = db.collection("routes")
            .document(routeId)
            .set(routeData);
        
        WriteResult result = future.get();
        log.info("Route sauvegardée dans Firestore (ID: {}) à: {}", 
                 routeId, result.getUpdateTime());
    }
    
    /**
     * Vérifier si Firestore est disponible
     */
    public boolean isFirestoreAvailable() {
        try {
            Firestore db = getFirestore();
            // Test de connexion simple - essayer de lire un document
            db.collection("health").document("check").get();
            return true;
        } catch (Exception e) {
            log.warn("Firestore non disponible: {}", e.getMessage());
            return false;
        }
    }
}