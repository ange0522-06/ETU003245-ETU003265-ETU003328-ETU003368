package com.cloud.controller;

import com.cloud.model.PhotoSignalement;
import com.cloud.service.PhotoSignalementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signalements/{idSignalement}/photos")
public class PhotoSignalementController {

    private final PhotoSignalementService photoService;

    public PhotoSignalementController(PhotoSignalementService photoService) {
        this.photoService = photoService;
    }

    /**
     * GET /api/signalements/{idSignalement}/photos
     * Récupère toutes les photos d'un signalement
     */
    @GetMapping
    public ResponseEntity<List<PhotoSignalement>> getPhotos(@PathVariable Long idSignalement) {
        List<PhotoSignalement> photos = photoService.getPhotosBySignalement(idSignalement);
        return ResponseEntity.ok(photos);
    }

    /**
     * POST /api/signalements/{idSignalement}/photos
     * Upload une nouvelle photo pour un signalement
     */
    @PostMapping
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long idSignalement,
            @RequestParam("file") MultipartFile file) {
        try {
            PhotoSignalement photo = photoService.addPhoto(idSignalement, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(photo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors de l'upload: " + e.getMessage()));
        }
    }

    /**
     * POST /api/signalements/{idSignalement}/photos/url
     * Ajoute une photo par URL (pour import Firebase)
     */
    @PostMapping("/url")
    public ResponseEntity<?> addPhotoByUrl(
            @PathVariable Long idSignalement,
            @RequestBody Map<String, String> body) {
        try {
            String url = body.get("url");
            if (url == null || url.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "URL manquante"));
            }
            PhotoSignalement photo = photoService.addPhotoByUrl(idSignalement, url);
            return ResponseEntity.status(HttpStatus.CREATED).body(photo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/signalements/{idSignalement}/photos/{idPhoto}
     * Supprime une photo spécifique
     */
    @DeleteMapping("/{idPhoto}")
    public ResponseEntity<?> deletePhoto(
            @PathVariable Long idSignalement,
            @PathVariable Long idPhoto) {
        try {
            photoService.deletePhoto(idPhoto);
            return ResponseEntity.ok(Map.of("message", "Photo supprimée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/signalements/{idSignalement}/photos
     * Supprime toutes les photos d'un signalement
     */
    @DeleteMapping
    public ResponseEntity<?> deleteAllPhotos(@PathVariable Long idSignalement) {
        photoService.deleteAllPhotosBySignalement(idSignalement);
        return ResponseEntity.ok(Map.of("message", "Toutes les photos ont été supprimées"));
    }

    /**
     * GET /api/signalements/{idSignalement}/photos/count
     * Compte le nombre de photos
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countPhotos(@PathVariable Long idSignalement) {
        long count = photoService.countPhotos(idSignalement);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
