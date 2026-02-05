package com.cloud.controller;

import com.cloud.model.Signalement;
import com.cloud.service.FireStoreService;
import com.cloud.service.SignalementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/firebase/signalements")
@RequiredArgsConstructor
public class FirebaseSignalementController {
    private final FireStoreService fireStoreService;
    private final SignalementService signalementService;

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
    public ResponseEntity<?> getAllFromFirebase() {
        try {
            List<Map<String, Object>> signalements = fireStoreService.getAllSignalementsFromFirestore();
            return ResponseEntity.ok(signalements);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
