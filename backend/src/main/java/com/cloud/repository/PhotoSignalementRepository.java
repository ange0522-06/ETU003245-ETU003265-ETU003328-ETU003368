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
    List<PhotoSignalement> findByIdSignalement(String idSignalement);
    
    /**
     * Supprime toutes les photos d'un signalement
     */
    void deleteByIdSignalement(String idSignalement);
    
    /**
     * Compte le nombre de photos pour un signalement
     */
    long countByIdSignalement(String idSignalement);
}
