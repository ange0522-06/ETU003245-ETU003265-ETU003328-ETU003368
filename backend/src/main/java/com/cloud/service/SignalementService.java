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
}
