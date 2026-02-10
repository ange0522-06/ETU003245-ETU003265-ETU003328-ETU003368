# 🐳 Guide de Déploiement avec Docker

Ce guide explique comment dockeriser et déployer votre application complète (Backend Spring Boot + Frontend React + PostgreSQL).

## 📋 Prérequis

- Docker Desktop installé et démarré
- Docker Compose (inclus avec Docker Desktop)
- Au moins 4 GB de RAM disponible pour Docker

## 🏗️ Architecture

L'application est composée de 3 services:

1. **PostgreSQL** (Base de données)
   - Port: 5432
   - Image: `postgres:15-alpine`

2. **Backend Spring Boot** (API Java)
   - Port: 8080
   - Build: Maven + Java 17
   - Dépendances: PostgreSQL, Firebase

3. **Frontend React** (Interface Web)
   - Port: 5173 (dev) ou 3000 (prod)
   - Build: Node.js + Vite
   - Serveur: Vite (dev) ou Nginx (prod)

## 🚀 Démarrage Rapide

### Option 1: Mode Développement (avec hot reload)

```bash
# À la racine du projet
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

### Option 2: Mode Production (avec Nginx)

1. Modifiez [docker-compose.yml](docker-compose.yml):
   - Commentez le service `frontend-dev`
   - Décommentez le service `frontend-prod`

2. Lancez les services:
```bash
docker-compose up -d
```

## 📝 Commandes Utiles

### Gestion des conteneurs

```bash
# Démarrer tous les services
docker-compose up -d

# Voir l'état des services
docker-compose ps

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend-dev
docker-compose logs -f postgres

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend
```

### Rebuild après modification

```bash
# Rebuild tous les services
docker-compose up -d --build

# Rebuild un service spécifique
docker-compose up -d --build backend
docker-compose up -d --build frontend-dev
```

### Accès aux conteneurs

```bash
# Accéder au shell du backend
docker exec -it cloud_backend sh

# Accéder au shell de PostgreSQL
docker exec -it cloud_postgres psql -U postgres -d cloud

# Accéder au shell du frontend
docker exec -it cloud_frontend_dev sh
```

### Debug et nettoyage

```bash
# Voir l'utilisation des ressources
docker stats

# Nettoyer les images non utilisées
docker image prune -a

# Nettoyer tout (images, conteneurs, volumes, réseaux)
docker system prune -a --volumes
```

## 🌐 Accès aux Services

Une fois les services démarrés:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend (dev) | http://localhost:5173 | Interface React avec hot reload |
| Frontend (prod) | http://localhost:3000 | Interface React optimisée |
| Backend API | http://localhost:8080/api | API REST Spring Boot |
| Health Check | http://localhost:8080/api/health | Vérification santé backend |
| PostgreSQL | localhost:5432 | Base de données (user: postgres, pass: 18/20) |

## 🔧 Configuration

### Variables d'environnement

#### Backend ([backend/src/main/resources/application.properties](backend/src/main/resources/application.properties))
- Configuré automatiquement via docker-compose.yml
- Les variables DB pointent vers le conteneur `postgres`

#### Frontend ([Frontend/react/webapp/.env](Frontend/react/webapp/.env))
```env
VITE_API_URL=http://localhost:8080/api
```

### Fichiers Docker

```
.
├── docker-compose.yml                    # Orchestration globale
├── backend/
│   ├── Dockerfile                        # Build backend (multi-stage)
│   └── .dockerignore                     # Exclusions backend
└── Frontend/react/webapp/
    ├── Dockerfile                        # Build frontend prod (Nginx)
    ├── Dockerfile.dev                    # Build frontend dev (Vite)
    ├── nginx.conf                        # Config Nginx pour prod
    └── .dockerignore                     # Exclusions frontend
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que PostgreSQL est prêt
docker-compose logs postgres

# Redémarrer le backend
docker-compose restart backend
```

### Le frontend ne se connecte pas au backend

1. Vérifiez que le backend est démarré:
```bash
curl http://localhost:8080/api/health
```

2. Vérifiez la variable d'environnement dans [Frontend/react/webapp/.env](Frontend/react/webapp/.env)

3. Rebuild le frontend:
```bash
docker-compose up -d --build frontend-dev
```

### Problèmes de permissions (Linux/Mac)

```bash
# Donner les permissions aux scripts
chmod +x backend/mvnw

# Problèmes de volumes
docker-compose down -v
docker-compose up -d
```

### Port déjà utilisé

Si un port est déjà utilisé, modifiez [docker-compose.yml](docker-compose.yml):

```yaml
services:
  backend:
    ports:
      - "8081:8080"  # Utiliser 8081 au lieu de 8080
```

### Réinitialiser complètement

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker rmi $(docker images -q cloud*)

# Rebuilder from scratch
docker-compose up -d --build
```

## 📊 Workflow de Développement

### 1. Première installation

```bash
# Cloner le projet
cd quadrinome/ETU003245-ETU003265-ETU003328-ETU003368

# Démarrer Docker Desktop

# Lancer tous les services
docker-compose up -d

# Attendre que tout soit prêt (environ 2-3 minutes)
docker-compose logs -f
```

### 2. Développement quotidien

```bash
# Démarrer (si arrêté)
docker-compose up -d

# Travailler normalement
# - Le frontend se recharge automatiquement (hot reload)
# - Pour le backend, rebuild après modifications importantes

# Voir les logs si besoin
docker-compose logs -f backend
docker-compose logs -f frontend-dev

# Arrêter en fin de journée
docker-compose down
```

### 3. Tests et modifications

```bash
# Après modification du code backend
docker-compose up -d --build backend

# Après modification du code frontend
# Aucune action nécessaire en mode dev (hot reload automatique)

# En mode production
docker-compose up -d --build frontend-prod
```

## 🔐 Sécurité

### En production, changez:

1. **Mot de passe PostgreSQL** dans [docker-compose.yml](docker-compose.yml):
```yaml
POSTGRES_PASSWORD: VotreMotDePasseSecurise
```

2. **JWT Secret** dans [backend/src/main/resources/application.properties](backend/src/main/resources/application.properties):
```properties
app.jwt.secret=UnSecretTresLongEtAleatoire
```

3. **Firebase credentials** - Ne commitez JAMAIS [Firebase-service-account.json](backend/src/main/resources/Firebase-service-account.json)

## 📦 Build de Production

Pour créer des images de production:

```bash
# Build backend
cd backend
docker build -t cloud-backend:1.0 .

# Build frontend
cd ../Frontend/react/webapp
docker build -t cloud-frontend:1.0 .
```

## 🎯 Checklist de Déploiement

- [ ] Docker Desktop est démarré
- [ ] Les ports 5432, 8080, 5173 sont disponibles
- [ ] Les fichiers [Firebase-service-account.json](backend/src/main/resources/Firebase-service-account.json) et [application.properties](backend/src/main/resources/application.properties) sont configurés
- [ ] La variable `VITE_API_URL` est correcte dans [.env](Frontend/react/webapp/.env)
- [ ] `docker-compose up -d` exécuté
- [ ] Vérifier http://localhost:8080/api/health
- [ ] Vérifier http://localhost:5173

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Vite Docker Guide](https://vitejs.dev/guide/build.html#docker)

---

**Problèmes?** Consultez la section Dépannage ou vérifiez les logs avec `docker-compose logs -f`
