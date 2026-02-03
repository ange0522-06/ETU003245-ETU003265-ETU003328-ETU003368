
package com.cloud.controller;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map;
import com.cloud.model.Signalement;
import com.cloud.service.SignalementService;
import com.cloud.service.FireStoreService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {
    private final SignalementService signalementService;
    private final FireStoreService fireStoreService;

    public SignalementController(SignalementService signalementService, FireStoreService fireStoreService) {
        this.signalementService = signalementService;
        this.fireStoreService = fireStoreService;
    }

    @GetMapping
    public ResponseEntity<List<Signalement>> getAllSignalements() {
        List<Signalement> signalements = signalementService.getAllSignalements();
        return ResponseEntity.ok(signalements);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        signalementService.updateStatus(id, newStatus);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Statut modifié avec succès");
        response.put("id", id);
        response.put("newStatus", newStatus);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Signalement> updateSignalement(@PathVariable Long id, @RequestBody Signalement body) {
        Signalement updated = signalementService.updateSignalement(id, body);
        // synchroniser vers Firestore
        fireStoreService.saveSignalementToFirestore(updated);
        return ResponseEntity.ok(updated);
    }
}
