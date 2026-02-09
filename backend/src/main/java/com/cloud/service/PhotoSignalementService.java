package com.cloud.service;

import com.cloud.model.PhotoSignalement;
import com.cloud.repository.PhotoSignalementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoSignalementService {

    private final PhotoSignalementRepository photoRepository;
    
    // Répertoire où les photos seront stockées
    private static final String UPLOAD_DIR = "uploads/photos/";

    public PhotoSignalementService(PhotoSignalementRepository photoRepository) {
        this.photoRepository = photoRepository;
        
        // Créer le répertoire s'il n'existe pas
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage des photos", e);
        }
    }

    /**
     * Récupère toutes les photos d'un signalement
     */
    public List<PhotoSignalement> getPhotosBySignalement(String idSignalement) {
        return photoRepository.findByIdSignalement(idSignalement);
    }

    /**
     * Ajoute une photo pour un signalement (upload fichier)
     */
    @Transactional
    public PhotoSignalement addPhoto(String idSignalement, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }

        // Générer un nom unique pour le fichier
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
            : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Sauvegarder le fichier
        Path targetPath = Paths.get(UPLOAD_DIR + filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Enregistrer en base de données
        PhotoSignalement photo = new PhotoSignalement();
        photo.setIdSignalement(idSignalement);
        photo.setUrlPhoto("/uploads/photos/" + filename); // URL relative
        
        return photoRepository.save(photo);
    }

    /**
     * Ajoute une photo avec URL directe (pour import Firebase)
     */
    @Transactional
    public PhotoSignalement addPhotoByUrl(String idSignalement, String urlPhoto) {
        PhotoSignalement photo = new PhotoSignalement();
        photo.setIdSignalement(idSignalement);
        photo.setUrlPhoto(urlPhoto);
        return photoRepository.save(photo);
    }

    /**
     * Supprime une photo
     */
    @Transactional
    public void deletePhoto(Long idPhoto) {
        PhotoSignalement photo = photoRepository.findById(idPhoto)
            .orElseThrow(() -> new RuntimeException("Photo introuvable"));
        
        // Supprimer le fichier physique si c'est un upload local
        if (photo.getUrlPhoto().startsWith("/uploads/")) {
            try {
                String filename = photo.getUrlPhoto().replace("/uploads/photos/", "");
                Path filePath = Paths.get(UPLOAD_DIR + filename);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log l'erreur mais continue la suppression en base
                System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            }
        }
        
        photoRepository.deleteById(idPhoto);
    }

    /**
     * Supprime toutes les photos d'un signalement
     */
    @Transactional
    public void deleteAllPhotosBySignalement(String idSignalement) {
        List<PhotoSignalement> photos = photoRepository.findByIdSignalement(idSignalement);
        
        // Supprimer les fichiers physiques
        for (PhotoSignalement photo : photos) {
            if (photo.getUrlPhoto().startsWith("/uploads/")) {
                try {
                    String filename = photo.getUrlPhoto().replace("/uploads/photos/", "");
                    Path filePath = Paths.get(UPLOAD_DIR + filename);
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
                }
            }
        }
        
        photoRepository.deleteByIdSignalement(idSignalement);
    }

    /**
     * Compte le nombre de photos pour un signalement
     */
    public long countPhotos(String idSignalement) {
        return photoRepository.countByIdSignalement(idSignalement);
    }
}
