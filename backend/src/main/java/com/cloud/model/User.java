package com.cloud.model;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import java.time.LocalDateTime;


@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String role;

    @Column(nullable = false)
    private boolean locked = false;

    @Column(nullable = false)
    private int failedAttempts = 0;
    
    
    // Nouveaux champs pour le tracking Firebase
    @Column(name = "firebase_uid")
    private String firebaseUid;
    
    @Column(name = "firebase_synced_at")
    private LocalDateTime firebaseSyncedAt;
    
    @Column(name = "sync_status")
    private String syncStatus = "NOT_SYNCED";

    // Getters et setters existants
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isLocked() {
        return locked;
    }
    public void setLocked(boolean locked) {
        this.locked = locked;
    }
    public int getFailedAttempts() {
        return failedAttempts;
    }
    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }
    
    // Nouveaux getters et setters pour Firebase
    public String getFirebaseUid() {
        return firebaseUid;
    }
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }
    
    public LocalDateTime getFirebaseSyncedAt() {
        return firebaseSyncedAt;
    }
    public void setFirebaseSyncedAt(LocalDateTime firebaseSyncedAt) {
        this.firebaseSyncedAt = firebaseSyncedAt;
    }
    
    public String getSyncStatus() {
        return syncStatus;
    }
    public void setSyncStatus(String syncStatus) {
        this.syncStatus = syncStatus;
    }
    
    // Méthodes utiles
    public boolean isFirebaseSynced() {
        return firebaseUid != null && !firebaseUid.isEmpty() && "SYNCED".equals(syncStatus);
    }
    
    public boolean isEligibleForFirebaseSync() {
        return "user".equalsIgnoreCase(role);
    }
}