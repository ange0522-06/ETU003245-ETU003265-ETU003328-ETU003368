package com.cloud.service;

import com.cloud.model.Signalement;
import com.cloud.repository.SignalementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SignalementService {
    private final SignalementRepository signalementRepository;

    public SignalementService(SignalementRepository signalementRepository) {
        this.signalementRepository = signalementRepository;
    }

    public List<Signalement> getAllSignalements() {
        return signalementRepository.findAll();
    }

    public Signalement addSignalement(Signalement signalement) {
        return signalementRepository.save(signalement);
    }

    public void updateStatus(Long id, String newStatus) {
        Signalement s = signalementRepository.findById(id).orElseThrow();
        s.setStatut(newStatus);
        signalementRepository.save(s);
    }
    public Signalement updateSignalement(Long id, Signalement updated) {
        return signalementRepository.findById(id).map(s -> {
            s.setTitre(updated.getTitre() != null ? updated.getTitre() : s.getTitre());
            s.setDescription(updated.getDescription() != null ? updated.getDescription() : s.getDescription());
            // latitude/longitude default 0 check
            if (updated.getLatitude() != 0d) s.setLatitude(updated.getLatitude());
            if (updated.getLongitude() != 0d) s.setLongitude(updated.getLongitude());
            s.setStatut(updated.getStatut() != null ? updated.getStatut() : s.getStatut());
            s.setSurfaceM2(updated.getSurfaceM2() != null ? updated.getSurfaceM2() : s.getSurfaceM2());
            s.setBudget(updated.getBudget() != null ? updated.getBudget() : s.getBudget());
            s.setEntreprise(updated.getEntreprise() != null ? updated.getEntreprise() : s.getEntreprise());
            return signalementRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Signalement not found"));
    }
}
