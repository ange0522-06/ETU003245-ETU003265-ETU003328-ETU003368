package com.cloud.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "photo_signalement")
public class PhotoSignalement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_photo")
    private Long idPhoto;

    @Column(name = "id_signalement", nullable = false)
    private Long idSignalement;

    @Column(name = "url_photo", nullable = false, columnDefinition = "TEXT")
    private String urlPhoto;

    @Column(name = "date_ajout")
    private Timestamp dateAjout;

    // Relation ManyToOne optionnelle vers Signalement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_signalement", insertable = false, updatable = false)
    private Signalement signalement;

    // Constructeurs
    public PhotoSignalement() {
        this.dateAjout = new Timestamp(System.currentTimeMillis());
    }

    public PhotoSignalement(Long idSignalement, String urlPhoto) {
        this.idSignalement = idSignalement;
        this.urlPhoto = urlPhoto;
        this.dateAjout = new Timestamp(System.currentTimeMillis());
    }

    // Getters et Setters
    public Long getIdPhoto() {
        return idPhoto;
    }

    public void setIdPhoto(Long idPhoto) {
        this.idPhoto = idPhoto;
    }

    public Long getIdSignalement() {
        return idSignalement;
    }

    public void setIdSignalement(Long idSignalement) {
        this.idSignalement = idSignalement;
    }

    public String getUrlPhoto() {
        return urlPhoto;
    }

    public void setUrlPhoto(String urlPhoto) {
        this.urlPhoto = urlPhoto;
    }

    public Timestamp getDateAjout() {
        return dateAjout;
    }

    public void setDateAjout(Timestamp dateAjout) {
        this.dateAjout = dateAjout;
    }

    public Signalement getSignalement() {
        return signalement;
    }

    public void setSignalement(Signalement signalement) {
        this.signalement = signalement;
    }
}
