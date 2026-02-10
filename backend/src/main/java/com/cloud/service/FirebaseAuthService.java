package com.cloud.service;

import com.cloud.model.User;
import com.cloud.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.CreateRequest;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.google.firebase.auth.ListUsersPage;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FirebaseAuthService {

    private final FireStoreService fireStoreService;
    private final UserRepository userRepository;

    public FirebaseAuthService(FireStoreService fireStoreService, UserRepository userRepository) {
        this.fireStoreService = fireStoreService;
        this.userRepository = userRepository;
    }

    // INSCRIPTION
    public UserRecord register(String email, String password) throws FirebaseAuthException {

        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password);

        return FirebaseAuth.getInstance().createUser(request);
    }

    // VÉRIFICATION TOKEN (LOGIN)
    public String verifyToken(String idToken) throws FirebaseAuthException {
        return FirebaseAuth.getInstance()
                .verifyIdToken(idToken)
                .getUid();
    }

    // Création d'un utilisateur (avec displayName optionnel)
    public UserRecord createUser(String email, String password, String displayName) throws FirebaseAuthException {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password);

        if (displayName != null && !displayName.isEmpty()) {
            request.setDisplayName(displayName);
        }

        return FirebaseAuth.getInstance().createUser(request);
    }

    // Vérifie si Firebase Admin est disponible (utilisé par les contrôleurs de test)
    public boolean isFirebaseAvailable() {
        try {
            FirebaseAuth.getInstance().listUsers(null);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Récupère tous les utilisateurs Firebase (UID, email, displayName)
    public List<Map<String, Object>> listAllUsers() throws FirebaseAuthException {
        List<Map<String, Object>> users = new ArrayList<>();
        ListUsersPage page = FirebaseAuth.getInstance().listUsers(null);

        while (page != null) {
            for (UserRecord user : page.getValues()) {
                Map<String, Object> m = new HashMap<>();
                m.put("uid", user.getUid());
                m.put("email", user.getEmail());
                m.put("displayName", user.getDisplayName());
                users.add(m);
            }
            page = page.getNextPage();
        }

        return users;
    }

    /**
     * Synchroniser un utilisateur PostgreSQL vers Firebase Auth
     */
    public String syncUserToFirebase(User user, String plainPassword) {
        try {
            // Vérifier l'éligibilité (seuls les utilisateurs avec rôle "user")
            if (!user.isEligibleForFirebaseSync()) {
                throw new RuntimeException("Utilisateur non éligible pour la synchronisation Firebase (rôle: " + user.getRole() + ")");
            }
            
            // Marquer comme en cours de synchronisation
            user.setSyncStatus("SYNCING");
            userRepository.save(user);
            
            // Vérifier si l'utilisateur existe déjà dans Firebase
            UserRecord existingUser = null;
            try {
                existingUser = FirebaseAuth.getInstance().getUserByEmail(user.getEmail());
                log.info("Utilisateur existant trouvé dans Firebase: {}", user.getEmail());
            } catch (Exception e) {
                log.info("Utilisateur non trouvé dans Firebase, création en cours: {}", user.getEmail());
            }

            String uid;
            if (existingUser != null) {
                // Mettre à jour l'utilisateur existant
                UpdateRequest updateRequest = new UpdateRequest(existingUser.getUid())
                        .setPassword(plainPassword)
                        .setDisplayName(user.getEmail())
                        .setDisabled(user.isLocked());

                UserRecord updatedUser = FirebaseAuth.getInstance().updateUser(updateRequest);
                uid = updatedUser.getUid();
                log.info("Utilisateur mis à jour dans Firebase Auth: {} (UID: {})", user.getEmail(), uid);
            } else {
                // Créer un nouvel utilisateur
                CreateRequest createRequest = new CreateRequest()
                        .setEmail(user.getEmail())
                        .setPassword(plainPassword)
                        .setDisplayName(user.getEmail())
                        .setDisabled(user.isLocked());

                UserRecord createdUser = FirebaseAuth.getInstance().createUser(createRequest);
                uid = createdUser.getUid();
                log.info("Nouvel utilisateur créé dans Firebase Auth: {} (UID: {})", user.getEmail(), uid);
            }

            // Sauvegarder les informations supplémentaires dans Firestore
            saveUserProfileToFirestore(uid, user);
            
            // Enregistrer les informations de synchronisation en base
            user.setFirebaseUid(uid);
            user.setFirebaseSyncedAt(java.time.LocalDateTime.now());
            user.setSyncStatus("SYNCED");
            userRepository.save(user);
            
            log.info("✅ Utilisateur {} synchronisé avec succès vers Firebase (UID: {})", user.getEmail(), uid);
            return uid;
        } catch (Exception e) {
            // Marquer comme erreur de synchronisation
            user.setSyncStatus("SYNC_ERROR");
            userRepository.save(user);
            
            log.error("Erreur lors de la synchronisation de l'utilisateur {} vers Firebase: {}", 
                     user.getEmail(), e.getMessage());
            throw new RuntimeException("Échec de la synchronisation vers Firebase: " + e.getMessage());
        }
    }

    /**
     * Sauvegarder le profil utilisateur dans Firestore
     */
    private void saveUserProfileToFirestore(String uid, User user) {
        try {
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            userData.put("locked", user.isLocked());
            userData.put("failedAttempts", user.getFailedAttempts());
            userData.put("source", "postgresql");
            
            fireStoreService.saveUserToFirestore(uid, userData);
            log.info("Profil utilisateur sauvegardé dans Firestore: {} (UID: {})", user.getEmail(), uid);
        } catch (Exception e) {
            log.error("Erreur lors de la sauvegarde du profil dans Firestore: {}", e.getMessage());
        }
    }

    /**
     * Synchroniser tous les utilisateurs PostgreSQL vers Firebase
     * SEULEMENT les utilisateurs avec le rôle "user"
     * Utilise le mot de passe stocké en base (en clair dans ce cas)
     */
    public int syncAllUsersToFirebase(java.util.List<User> users) {
        int successCount = 0;
        int eligibleCount = 0;

        for (User user : users) {
            // Filtrer seulement les utilisateurs avec le rôle "user"
            if (!user.isEligibleForFirebaseSync()) {
                log.debug("Utilisateur {} ignoré (rôle: {}, non éligible pour Firebase)", 
                         user.getEmail(), user.getRole());
                continue;
            }
            
            eligibleCount++;
            
            try {
                // Utiliser le mot de passe réel de l'utilisateur stocké en base
                String userPassword = preparePasswordForFirebase(user.getPassword());
                
                syncUserToFirebase(user, userPassword);
                successCount++;
                
            } catch (Exception e) {
                log.error("Échec de la synchronisation pour l'utilisateur {}: {}", 
                         user.getEmail(), e.getMessage());
            }
        }

        log.info("🔥 Synchronisation Firebase terminée. Éligibles: {}, Succès: {}", eligibleCount, successCount);
        return successCount;
    }
    
    /**
     * Prépare le mot de passe pour Firebase Auth
     * - Firebase exige au minimum 6 caractères
     * - Si le mot de passe est hashé (BCrypt), utiliser un mot de passe temporaire
     * - Si le mot de passe est trop court, le padder avec des caractères
     */
    private String preparePasswordForFirebase(String password) {
        if (password == null || password.isEmpty()) {
            return "Temp123!";
        }
        
        // Si le mot de passe est hashé (BCrypt), utiliser un mot de passe temporaire
        if (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")) {
            log.info("Mot de passe hashé détecté, utilisation du mot de passe temporaire");
            return "Temp123!";
        }
        
        // Firebase exige minimum 6 caractères - padder si nécessaire
        if (password.length() < 6) {
            String paddedPassword = password + "000000".substring(0, 6 - password.length());
            log.info("Mot de passe trop court ({}), paddé à 6 caractères: {} -> {}", 
                     password.length(), password, paddedPassword);
            return paddedPassword;
        }
        
        return password;
    }

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    public void sendPasswordResetEmail(String email) {
        try {
            String resetLink = FirebaseAuth.getInstance().generatePasswordResetLink(email);
            log.info("Email de réinitialisation généré pour: {}", email);
        } catch (Exception e) {
            log.warn("Impossible d'envoyer l'email de réinitialisation à {}: {}", email, e.getMessage());
        }
    }

    /**
     * Mot de passe temporaire fixe pour la synchronisation
     */
    public static final String DEFAULT_TEMP_PASSWORD = "Temp123!";
    
    /**
     * Générer un mot de passe temporaire sécurisé
     * @deprecated Utiliser DEFAULT_TEMP_PASSWORD à la place pour la cohérence
     */
    @Deprecated
    private String generateTempPassword() {
        return DEFAULT_TEMP_PASSWORD;
    }
}
