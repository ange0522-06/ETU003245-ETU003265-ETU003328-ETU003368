package com.cloud.model;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "signalement")
public class Signalement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSignalement;

    private String titre;
    private String description;
    private double latitude;
    private double longitude;
    private Timestamp dateSignalement;
    private String statut;
    private Double surfaceM2;
    private Double budget;
    private String entreprise;

    @ManyToOne
    @JoinColumn(name = "id_user")
    private User utilisateur;

    // Getters et setters
    public Long getIdSignalement() { return idSignalement; }
    public void setIdSignalement(Long idSignalement) { this.idSignalement = idSignalement; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public Timestamp getDateSignalement() { return dateSignalement; }
    public void setDateSignalement(Timestamp dateSignalement) { this.dateSignalement = dateSignalement; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public Double getSurfaceM2() { return surfaceM2; }
    public void setSurfaceM2(Double surfaceM2) { this.surfaceM2 = surfaceM2; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public String getEntreprise() { return entreprise; }
    public void setEntreprise(String entreprise) { this.entreprise = entreprise; }
    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }
}
