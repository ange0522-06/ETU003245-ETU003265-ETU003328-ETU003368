package com.cloud.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.FirebaseApp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class FireStoreService {
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FireStoreService.class);
    
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
            ApiFuture<DocumentSnapshot> f = db.collection("health").document("check").get();
            // Wait briefly for result to detect connectivity issues
            f.get();
            return true;
        } catch (Exception e) {
            log.warn("Firestore non disponible: {}", e.toString());
            log.debug("Stack: ", e);
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
                // Ajouter les dates d'avancement
                data.put("dateNouveau", s.getDateNouveau() != null ? s.getDateNouveau().toString() : null);
                data.put("dateEnCours", s.getDateEnCours() != null ? s.getDateEnCours().toString() : null);
                data.put("dateTermine", s.getDateTermine() != null ? s.getDateTermine().toString() : null);
                data.put("avancement", s.getAvancement());
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
            log.warn("Erreur lors de la récupération des signalements Firestore: {}", e.toString());
            log.debug("Stack: ", e);
        }
        return result;
    }

    /**
     * Récupérer uniquement les signalements non importés depuis Firestore
     * (ceux où importedToSQL n'existe pas ou est false)
     */
    public List<Map<String, Object>> getUnimportedSignalementsFromFirestore() {
        Firestore db = getFirestore();
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        try {
            ApiFuture<QuerySnapshot> future = db.collection("signalements")
                .whereEqualTo("importedToSQL", false)
                .get();
            List<QueryDocumentSnapshot> docs = future.get().getDocuments();
            for (QueryDocumentSnapshot doc : docs) {
                Map<String, Object> data = doc.getData();
                data.put("id", doc.getId());
                result.add(data);
            }
            
            // Ajouter aussi ceux qui n'ont pas le champ importedToSQL
            ApiFuture<QuerySnapshot> futureNoField = db.collection("signalements").get();
            List<QueryDocumentSnapshot> allDocs = futureNoField.get().getDocuments();
            for (QueryDocumentSnapshot doc : allDocs) {
                if (!doc.contains("importedToSQL")) {
                    Map<String, Object> data = doc.getData();
                    data.put("id", doc.getId());
                    // Vérifier si pas déjà ajouté
                    boolean alreadyAdded = result.stream()
                        .anyMatch(r -> r.get("id").equals(doc.getId()));
                    if (!alreadyAdded) {
                        result.add(data);
                    }
                }
            }
            
            log.info("{} signalements non importés trouvés dans Firestore", result.size());
        } catch (Exception e) {
            log.warn("Erreur lors de la récupération des signalements non importés: {}", e.toString());
            log.debug("Stack: ", e);
        }
        return result;
    }
    
    /**
     * Marquer un signalement comme importé dans SQL
     */
    public void markSignalementAsImported(String signalementId) {
        try {
            Firestore db = getFirestore();
            Map<String, Object> update = new HashMap<>();
            update.put("importedToSQL", true);
            update.put("importedAt", FieldValue.serverTimestamp());
            
            db.collection("signalements")
                .document(signalementId)
                .update(update);
            
            log.info("Signalement {} marqué comme importé dans Firestore", signalementId);
        } catch (Exception e) {
            log.warn("Erreur lors du marquage du signalement {} comme importé: {}", 
                     signalementId, e.getMessage());
        }
    }

    /**
     * Sauvegarder ou mettre à jour un seul signalement dans Firestore
     * Utilise merge pour préserver les champs existants (type, importedToSQL, etc.)
     */
    public void saveSignalementToFirestore(com.cloud.model.Signalement s) {
        try {
            Firestore db = getFirestore();
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
            // Ajouter les dates d'avancement
            data.put("dateNouveau", s.getDateNouveau() != null ? s.getDateNouveau().toString() : null);
            data.put("dateEnCours", s.getDateEnCours() != null ? s.getDateEnCours().toString() : null);
            data.put("dateTermine", s.getDateTermine() != null ? s.getDateTermine().toString() : null);
            data.put("avancement", s.getAvancement());
            
            // Utiliser merge pour préserver les champs existants dans Firebase
            db.collection("signalements").document(String.valueOf(s.getIdSignalement()))
                .set(data, SetOptions.merge());
            
            log.info("Signalement {} mis à jour dans Firestore (merge)", s.getIdSignalement());
        } catch (Exception e) {
            log.warn("Erreur sauvegarde signalement dans Firestore {}: {}", s.getIdSignalement(), e.getMessage());
        }
    }
}