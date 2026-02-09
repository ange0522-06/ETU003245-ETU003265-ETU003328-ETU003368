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

    public Signalement updateSignalement(String id, Signalement updated) {
        // UPSERT: Update si existe, Insert sinon (pour synchroniser depuis Firebase)
        Signalement s = signalementRepository.findById(id).orElse(new Signalement());
        
        // Si nouveau signalement, définir l'ID Firebase
        if (s.getIdSignalement() == null) {
            s.setIdSignalement(id);
        }
        
        // Mettre à jour les champs
        if (updated.getTitre() != null) s.setTitre(updated.getTitre());
        if (updated.getDescription() != null) s.setDescription(updated.getDescription());
        if (updated.getLatitude() != 0d) s.setLatitude(updated.getLatitude());
        if (updated.getLongitude() != 0d) s.setLongitude(updated.getLongitude());
        if (updated.getDateSignalement() != null) s.setDateSignalement(updated.getDateSignalement());
        
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
        
        if (updated.getSurfaceM2() != null) s.setSurfaceM2(updated.getSurfaceM2());
        if (updated.getBudget() != null) s.setBudget(updated.getBudget());
        if (updated.getEntreprise() != null) s.setEntreprise(updated.getEntreprise());
        if (updated.getUtilisateur() != null) s.setUtilisateur(updated.getUtilisateur());
        
        return signalementRepository.save(s);
    }
}
