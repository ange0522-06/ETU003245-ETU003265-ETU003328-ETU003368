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
        InputStream serviceAccount = null;
        try {
            // Try load from classpath
            serviceAccount = getClass().getClassLoader().getResourceAsStream(firebaseConfigPath);
            if (serviceAccount == null) {
                // Try as filesystem path
                java.io.File f = new java.io.File(firebaseConfigPath);
                if (f.exists()) {
                    serviceAccount = new java.io.FileInputStream(f);
                }
            }

            if (serviceAccount == null) {
                throw new IllegalStateException("Firebase service account file not found on classpath or filesystem: " + firebaseConfigPath);
            }

            GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                return FirebaseApp.initializeApp(options);
            }

            return FirebaseApp.getInstance();

        } catch (Exception e) {
            // Provide a more descriptive error for troubleshooting
            throw new RuntimeException("Erreur initialisation Firebase - vérifiez le chemin du fichier de service account et les permissions: " + firebaseConfigPath, e);
        } finally {
            if (serviceAccount != null) {
                try { serviceAccount.close(); } catch (Exception ignored) {}
            }
        }
    }
}
