
package com.cloud.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.FirebaseApp;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class FireStoreService {
    private static final Logger log = LoggerFactory.getLogger(FireStoreService.class);
    
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
    /**
     * Sauvegarder tous les signalements SQL dans Firestore (collection signalements)
     */
    public int saveAllSignalementsToFirestore(List<com.cloud.model.Signalement> signalements) {
        Firestore db = getFirestore();
        int count = 0;
        for (com.cloud.model.Signalement s : signalements) {
            try {
                Map<String, Object> data = new HashMap<>();
                data.put("idSignalement", s.getIdSignalement());
                data.put("titre", s.getTitre());
                data.put("description", s.getDescription());
                data.put("latitude", s.getLatitude());
                data.put("longitude", s.getLongitude());
                data.put("dateSignalement", s.getDateSignalement() != null ? s.getDateSignalement().toString() : null);
                data.put("statut", s.getStatut());
                data.put("surfaceM2", s.getSurfaceM2());
                data.put("budget", s.getBudget());
                data.put("entreprise", s.getEntreprise());
                data.put("id_user", s.getUtilisateur() != null ? s.getUtilisateur().getId() : null);
                db.collection("signalements").document(String.valueOf(s.getIdSignalement())).set(data);
                count++;
            } catch (Exception e) {
                log.warn("Erreur lors de l'export du signalement {}: {}", s.getIdSignalement(), e.getMessage());
            }
        }
        return count;
    }

    /**
     * Récupérer tous les signalements depuis Firestore (collection signalements)
     */
    public List<Map<String, Object>> getAllSignalementsFromFirestore() {
        Firestore db = getFirestore();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = db.collection("signalements").get();
            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            for (QueryDocumentSnapshot doc : docs) {
                Map<String, Object> data = doc.getData();
                data.put("id", doc.getId());
                result.add(data);
            }
        } catch (Exception e) {
            log.warn("Erreur lors de la récupération des signalements Firestore: {}", e.getMessage());
        }
        return result;
    }
}