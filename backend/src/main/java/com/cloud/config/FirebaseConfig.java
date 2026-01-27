package com.cloud.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path}")
    private String firebaseConfigPath;

    @Bean
    public FirebaseApp firebaseApp() {
        try {
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream(firebaseConfigPath);
            if (serviceAccount == null) {
                throw new IllegalStateException("Firebase service account file not found: " + firebaseConfigPath);
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            }

            return FirebaseApp.getInstance();

        } catch (Exception e) {
            throw new RuntimeException("Erreur initialisation Firebase", e);
        }
    }
}
