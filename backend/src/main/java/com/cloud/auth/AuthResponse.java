package com.cloud.auth;

import com.cloud.model.User;

public class AuthResponse {
    private boolean success;
    private String token;
    private String message;
    private UserInfo user;
    
    // Constructeur pour succès
    public AuthResponse(String token, User user) {
        this.success = true;
        this.token = token;
        this.user = new UserInfo(user);
        this.message = "Connexion réussie";
    }
    
    // Constructeur pour échec
    public AuthResponse(String message) {
        this.success = false;
        this.message = message;
    }
    
    // Classe interne pour les données utilisateur (sans mot de passe)
    public static class UserInfo {
        private Long id;
        private String email;
        private String role;
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.role = user.getRole();
        }
        
        // Getters
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
        public String getName() { return email; } // Pour compatibilité
    }
    
    // Getters
    public boolean isSuccess() { return success; }
    public String getToken() { return token; }
    public String getMessage() { return message; }
    public UserInfo getUser() { return user; }
}
