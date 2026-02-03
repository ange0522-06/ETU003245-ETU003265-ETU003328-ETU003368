
package com.cloud.controller;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import java.util.Map;
import com.cloud.model.Signalement;
import com.cloud.service.SignalementService;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {
    private final SignalementService signalementService;

    public SignalementController(SignalementService signalementService) {
        this.signalementService = signalementService;
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
}
