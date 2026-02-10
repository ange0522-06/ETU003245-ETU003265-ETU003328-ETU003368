 
package com.cloud.service;

import com.cloud.model.User;
import com.cloud.security.JwtService;
import com.cloud.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private FirebaseAuthService firebaseAuthService;

    @Value("${security.login.max-attempts:3}")
    private int maxAttempts;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, FirebaseAuthService firebaseAuthService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.firebaseAuthService = firebaseAuthService;
    }


    public String authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isLocked()) {
            throw new RuntimeException("Account locked");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {

            user.setFailedAttempts(user.getFailedAttempts() + 1);

            if (user.getFailedAttempts() >= maxAttempts) {
                user.setLocked(true);
            }

            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }


        user.setFailedAttempts(0);
        userRepository.save(user);

        String springRole = "ROLE_" + user.getRole().toUpperCase();
        return jwtService.generateToken(user.getEmail(), springRole);
    }

    // private final UserRepository userRepository;
    // private final PasswordEncoder passwordEncoder;


    public User register(String email, String password, String role) {
        if(userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        if ("manager".equalsIgnoreCase(role)) {
            if (userRepository.existsByRoleIgnoreCase("manager")) {
                throw new RuntimeException("Un compte manager existe déjà.");
            }
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role != null ? role.toLowerCase() : "user"); // Stocke "user" ou "manager" en base, mais le JWT aura ROLE_...
        user.setLocked(false);
        user.setFailedAttempts(0);
        User savedUser = userRepository.save(user);
        
        // Synchroniser automatiquement vers Firebase si l'utilisateur est éligible (rôle "user")
        if (savedUser.isEligibleForFirebaseSync()) {
            try {
                String firebaseUid = firebaseAuthService.syncUserToFirebase(savedUser, password);
                log.info("✅ Utilisateur {} synchronisé vers Firebase avec UID: {}", email, firebaseUid);
            } catch (Exception e) {
                log.warn("⚠️ Échec de la synchronisation Firebase pour {}: {} (l'utilisateur peut se connecter sur le web)", 
                         email, e.getMessage());
                // On ne lance pas d'exception car l'utilisateur est quand même créé en base
            }
        }
        
        return savedUser;
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        return user;
    }
       // Classe utilitaire pour le résultat de login
    public static class LoginResult {
        private boolean success;
        private boolean locked;
        private int failedAttempts;
        private String token;
        private String role;
        public LoginResult(boolean success, boolean locked, int failedAttempts, String token, String role) {
            this.success = success;
            this.locked = locked;
            this.failedAttempts = failedAttempts;
            this.token = token;
            this.role = role;
        }
        public boolean isSuccess() { return success; }
        public boolean isLocked() { return locked; }
        public int getFailedAttempts() { return failedAttempts; }
        public String getToken() { return token; }
        public String getRole() { return role; }
    }

    // Nouvelle méthode pour login avec feedback détaillé
    public LoginResult tryLogin(String email, String password) {
        Optional<User> optUser = userRepository.findByEmail(email);
        if (!optUser.isPresent()) {
            return new LoginResult(false, false, 0, null, null);
        }
        User user = optUser.get();
        if (user.isLocked()) {
            return new LoginResult(false, true, user.getFailedAttempts(), null, null);
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= maxAttempts) {
                user.setLocked(true);
            }
            userRepository.save(user);
            return new LoginResult(false, user.isLocked(), user.getFailedAttempts(), null, null);
        }
        // Succès : reset failedAttempts
        user.setFailedAttempts(0);
        userRepository.save(user);
        String springRole = "ROLE_" + user.getRole().toUpperCase();
        String token = jwtService.generateToken(user.getEmail(), springRole);
        return new LoginResult(true, false, 0, token, user.getRole());
    }
}
