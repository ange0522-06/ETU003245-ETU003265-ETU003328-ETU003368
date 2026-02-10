# Stage 1: Build avec Maven
FROM maven:3.9-eclipse-temurin-17 as build

WORKDIR /app

# Copier les fichiers pom.xml
COPY pom.xml .

# Télécharger les dépendances
RUN mvn dependency:resolve

# Copier le code source
COPY src ./src

# Builder le projet
RUN mvn clean package -DskipTests

# Stage 2: Runtime avec Java
FROM eclipse-temurin:17-jre

WORKDIR /app

# Créer l'utilisateur app avec les bonnes permissions (Debian/Ubuntu)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Installer curl pour le health check Docker
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Créer les dossiers AVANT de changer d'utilisateur
RUN mkdir -p /app/uploads/photos && \
    chown -R appuser:appgroup /app

# Copier le WAR depuis le stage de build
COPY --from=build /app/target/*.war app.war

# Donner les permissions appropriées
RUN chown appuser:appgroup /app/app.war

# Changer vers l'utilisateur non-root
USER appuser

# Port
EXPOSE 8080

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.war"]