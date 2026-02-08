package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import com.cloud.model.Signalement;
import com.cloud.service.SignalementService;

@RestController
@RequestMapping("/api/stats")
@PreAuthorize("hasAuthority('ROLE_MANAGER')")
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

    @GetMapping("/traitement")
    public ResponseEntity<Map<String, Object>> getTraitementStats() {
        List<Signalement> signalements = signalementService.getAllSignalements();
        
        // Calculer les temps moyens de traitement
        long totalDelaiNouveauEnCours = 0;
        long totalDelaiEnCoursTermine = 0;
        long totalDelaiNouveauTermine = 0;
        int countNouveauEnCours = 0;
        int countEnCoursTermine = 0;
        int countNouveauTermine = 0;

        for (Signalement s : signalements) {
            // Délai nouveau -> en cours
            if (s.getDateNouveau() != null && s.getDateEnCours() != null) {
                long delai = s.getDateEnCours().getTime() - s.getDateNouveau().getTime();
                totalDelaiNouveauEnCours += delai;
                countNouveauEnCours++;
            }
            
            // Délai en cours -> terminé
            if (s.getDateEnCours() != null && s.getDateTermine() != null) {
                long delai = s.getDateTermine().getTime() - s.getDateEnCours().getTime();
                totalDelaiEnCoursTermine += delai;
                countEnCoursTermine++;
            }
            
            // Délai total nouveau -> terminé
            if (s.getDateNouveau() != null && s.getDateTermine() != null) {
                long delai = s.getDateTermine().getTime() - s.getDateNouveau().getTime();
                totalDelaiNouveauTermine += delai;
                countNouveauTermine++;
            }
        }

        // Convertir en jours (1 jour = 86400000 millisecondes)
        double moyenneNouveauEnCours = countNouveauEnCours > 0 
            ? (totalDelaiNouveauEnCours / (double) countNouveauEnCours) / 86400000.0 
            : 0;
        double moyenneEnCoursTermine = countEnCoursTermine > 0 
            ? (totalDelaiEnCoursTermine / (double) countEnCoursTermine) / 86400000.0 
            : 0;
        double moyenneTotale = countNouveauTermine > 0 
            ? (totalDelaiNouveauTermine / (double) countNouveauTermine) / 86400000.0 
            : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("moyenneNouveauEnCoursJours", Math.round(moyenneNouveauEnCours * 10) / 10.0);
        stats.put("moyenneEnCoursTermineJours", Math.round(moyenneEnCoursTermine * 10) / 10.0);
        stats.put("moyenneTotaleJours", Math.round(moyenneTotale * 10) / 10.0);
        stats.put("nombreSignalementsAnalyses", countNouveauTermine);
        
        return ResponseEntity.ok(stats);
    }
}
