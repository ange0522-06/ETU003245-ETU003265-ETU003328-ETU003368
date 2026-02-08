package com.cloud.service;

import com.cloud.model.Signalement;
import com.cloud.repository.SignalementRepository;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
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
        // Si c'est un nouveau signalement, initialiser dateNouveau
        if (signalement.getDateNouveau() == null) {
            signalement.setDateNouveau(new Timestamp(System.currentTimeMillis()));
        }
        return signalementRepository.save(signalement);
    }

    public Signalement updateSignalement(Long id, Signalement updated) {
        return signalementRepository.findById(id).map(s -> {
            s.setTitre(updated.getTitre() != null ? updated.getTitre() : s.getTitre());
            s.setDescription(updated.getDescription() != null ? updated.getDescription() : s.getDescription());
            // latitude/longitude default 0 check
            if (updated.getLatitude() != 0d) s.setLatitude(updated.getLatitude());
            if (updated.getLongitude() != 0d) s.setLongitude(updated.getLongitude());
            
            // Gérer les dates d'avancement lors du changement de statut
            if (updated.getStatut() != null && !updated.getStatut().equals(s.getStatut())) {
                Timestamp now = new Timestamp(System.currentTimeMillis());
                String newStatut = updated.getStatut().toLowerCase();
                
                switch (newStatut) {
                    case "nouveau":
                        if (s.getDateNouveau() == null) {
                            s.setDateNouveau(now);
                        }
                        break;
                    case "en cours":
                        if (s.getDateEnCours() == null) {
                            s.setDateEnCours(now);
                        }
                        // Assurer que dateNouveau existe
                        if (s.getDateNouveau() == null) {
                            s.setDateNouveau(s.getDateSignalement() != null ? s.getDateSignalement() : now);
                        }
                        break;
                    case "termine":
                    case "terminé":
                        if (s.getDateTermine() == null) {
                            s.setDateTermine(now);
                        }
                        // Assurer que les dates précédentes existent
                        if (s.getDateNouveau() == null) {
                            s.setDateNouveau(s.getDateSignalement() != null ? s.getDateSignalement() : now);
                        }
                        if (s.getDateEnCours() == null) {
                            s.setDateEnCours(now);
                        }
                        break;
                }
                s.setStatut(updated.getStatut());
            }
            
            s.setSurfaceM2(updated.getSurfaceM2() != null ? updated.getSurfaceM2() : s.getSurfaceM2());
            s.setBudget(updated.getBudget() != null ? updated.getBudget() : s.getBudget());
            s.setEntreprise(updated.getEntreprise() != null ? updated.getEntreprise() : s.getEntreprise());
            return signalementRepository.save(s);
        }).orElseThrow(() -> new RuntimeException("Signalement not found"));
    }
}
