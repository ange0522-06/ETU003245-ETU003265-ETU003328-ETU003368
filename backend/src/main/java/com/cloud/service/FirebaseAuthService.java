package com.cloud.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.ListUsersPage;
import com.google.firebase.auth.FirebaseAuthException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class FirebaseAuthService {

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
}
