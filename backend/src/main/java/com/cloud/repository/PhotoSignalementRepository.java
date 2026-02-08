package com.cloud.repository;

import com.cloud.model.PhotoSignalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoSignalementRepository extends JpaRepository<PhotoSignalement, Long> {
    
    /**
     * Récupère toutes les photos d'un signalement donné
     */
    List<PhotoSignalement> findByIdSignalement(Long idSignalement);
    
    /**
     * Supprime toutes les photos d'un signalement
     */
    void deleteByIdSignalement(Long idSignalement);
    
    /**
     * Compte le nombre de photos pour un signalement
     */
    long countByIdSignalement(Long idSignalement);
}
