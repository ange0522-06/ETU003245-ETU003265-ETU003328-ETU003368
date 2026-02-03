package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Signalement> updateSignalement(@PathVariable Long id, @RequestBody Signalement body) {
        Signalement updated = signalementService.updateSignalement(id, body);
        // synchroniser vers Firestore
        fireStoreService.saveSignalementToFirestore(updated);
        return ResponseEntity.ok(updated);
    }
}
