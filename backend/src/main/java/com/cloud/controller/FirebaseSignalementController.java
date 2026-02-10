package com.cloud.controller;

import com.cloud.model.Signalement;
import com.cloud.model.User;
import com.cloud.repository.UserRepository;
import com.cloud.service.FireStoreService;
import com.cloud.service.SignalementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/firebase/signalements")
public class FirebaseSignalementController {
    private final FireStoreService fireStoreService;
    private final SignalementService signalementService;
    private final UserRepository userRepository;
    
    public FirebaseSignalementController(FireStoreService fireStoreService, 
                                        SignalementService signalementService,
                                        UserRepository userRepository) {
        this.fireStoreService = fireStoreService;
        this.signalementService = signalementService;
        this.userRepository = userRepository;
    }

    // 1. Exporter tous les signalements SQL vers Firestore
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> syncToFirebase() {
        List<Signalement> all = signalementService.getAllSignalements();
        int count = fireStoreService.saveAllSignalementsToFirestore(all);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("exportedCount", count);
        return ResponseEntity.ok(resp);
    }

    // 2. Récupérer tous les signalements depuis Firestore
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFromFirebase() {
        List<Map<String, Object>> signalements = fireStoreService.getAllSignalementsFromFirestore();
        return ResponseEntity.ok(signalements);
    }
    
    // 3. Importer les signalements non importés depuis Firestore vers SQL
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importFromFirebase() {
        List<Map<String, Object>> unimportedSignalements = 
            fireStoreService.getUnimportedSignalementsFromFirestore();
        
        int importedCount = 0;
        int errorCount = 0;
        
        for (Map<String, Object> data : unimportedSignalements) {
            try {
                // Créer un objet Signalement depuis les données Firebase
                Signalement signalement = new Signalement();
                
                String id = data.get("idSignalement") != null 
                    ? String.valueOf(data.get("idSignalement")) 
                    : (String) data.get("id");
                signalement.setIdSignalement(id);
                
                if (data.get("titre") != null) {
                    signalement.setTitre((String) data.get("titre"));
                }
                if (data.get("description") != null) {
                    signalement.setDescription((String) data.get("description"));
                }
                if (data.get("latitude") != null) {
                    signalement.setLatitude(((Number) data.get("latitude")).doubleValue());
                }
                if (data.get("longitude") != null) {
                    signalement.setLongitude(((Number) data.get("longitude")).doubleValue());
                }
                if (data.get("statut") != null) {
                    signalement.setStatut((String) data.get("statut"));
                }
                if (data.get("surfaceM2") != null) {
                    signalement.setSurfaceM2(((Number) data.get("surfaceM2")).doubleValue());
                }
                if (data.get("budget") != null) {
                    signalement.setBudget(((Number) data.get("budget")).doubleValue());
                }
                if (data.get("entreprise") != null) {
                    signalement.setEntreprise((String) data.get("entreprise"));
                }
                
                // Gérer la date de signalement (supporte plusieurs formats)
                if (data.get("dateSignalement") != null) {
                    String dateStr = (String) data.get("dateSignalement");
                    try {
                        // Essayer le format ISO 8601 (depuis mobile: 2026-02-10T06:45:26.123Z)
                        if (dateStr.contains("T")) {
                            Instant instant = Instant.parse(dateStr);
                            signalement.setDateSignalement(Timestamp.from(instant));
                        } else {
                            // Format SQL standard (yyyy-MM-dd HH:mm:ss)
                            signalement.setDateSignalement(Timestamp.valueOf(dateStr));
                        }
                    } catch (Exception e) {
                        // Si échec, utiliser la date actuelle
                        signalement.setDateSignalement(new Timestamp(System.currentTimeMillis()));
                        System.err.println("Format de date non reconnu: " + dateStr + ", utilisation de la date actuelle");
                    }
                }
                
                // Gérer l'utilisateur
                if (data.get("id_user") != null) {
                    try {
                        Long userId = Long.valueOf(String.valueOf(data.get("id_user")));
                        User user = userRepository.findById(userId).orElse(null);
                        if (user != null) {
                            signalement.setUtilisateur(user);
                        }
                    } catch (NumberFormatException e) {
                        // Ignorer si l'ID utilisateur n'est pas un nombre valide
                    }
                }
                
                // Sauvegarder dans SQL via updateSignalement (qui fait un UPSERT)
                signalementService.updateSignalement(id, signalement);
                
                // Marquer comme importé dans Firebase
                fireStoreService.markSignalementAsImported(id);
                
                importedCount++;
            } catch (Exception e) {
                errorCount++;
                // Log l'erreur mais continue avec les autres
                System.err.println("Erreur lors de l'import du signalement: " + e.getMessage());
            }
        }
        
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("importedCount", importedCount);
        resp.put("errorCount", errorCount);
        resp.put("totalUnimported", unimportedSignalements.size());
        
        return ResponseEntity.ok(resp);
    }
}
