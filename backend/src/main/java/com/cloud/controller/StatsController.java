package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.cloud.model.Signalement;
import com.cloud.service.SignalementService;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final SignalementService signalementService;

    public StatsController(SignalementService signalementService) {
        this.signalementService = signalementService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Signalement> signalements = signalementService.getAllSignalements();
        int nbPoints = signalements.size();
        double totalSurface = signalements.stream().mapToDouble(s -> s.getSurfaceM2() != null ? s.getSurfaceM2() : 0).sum();
        double totalBudget = signalements.stream().mapToDouble(s -> s.getBudget() != null ? s.getBudget() : 0).sum();
        long nbTermine = signalements.stream().filter(s -> "termine".equalsIgnoreCase(s.getStatut())).count();
        int avancement = nbPoints > 0 ? (int) Math.round((nbTermine * 100.0) / nbPoints) : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("nbPoints", nbPoints);
        stats.put("totalSurface", totalSurface);
        stats.put("avancement", avancement);
        stats.put("totalBudget", totalBudget);
        return ResponseEntity.ok(stats);
    }
}
