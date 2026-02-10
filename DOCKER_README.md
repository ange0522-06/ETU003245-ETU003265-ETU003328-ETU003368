# 🐳 Démarrage Rapide avec Docker

## ⚡ Installation en 3 étapes

### 1. Vérifier les prérequis
- Docker Desktop installé et démarré
- Ports disponibles: 5432, 8080, 5173

### 2. Lancer l'application

**Windows PowerShell:**
```powershell
# Option A: Utiliser le script de gestion
.\docker-manage.ps1

# Option B: Commande directe
docker-compose up -d
```

**Linux/Mac:**
```bash
# Option A: Utiliser le script de gestion
chmod +x docker-manage.sh
./docker-manage.sh

# Option B: Commande directe
docker-compose up -d
```

### 3. Accéder à l'application

Attendez 2-3 minutes que tout démarre, puis:

- **Frontend**: http://localhost:5173
- **API Backend**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health

## 📝 Commandes Essentielles

```bash
# Démarrer
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Redémarrer après modification
docker-compose up -d --build
```

## 📚 Documentation Complète

Consultez [DOCKER_GUIDE.md](DOCKER_GUIDE.md) pour:
- Configuration détaillée
- Dépannage
- Commandes avancées
- Workflow de développement

## 🎯 Architecture

```
┌─────────────────┐
│  Frontend React │  Port 5173
│   (Vite + Hot   │
│     Reload)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Backend Spring  │  Port 8080
│      Boot       │
│  (Java 17 +     │
│   Firebase)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │  Port 5432
│   (Database)    │
└─────────────────┘
```

## 🛠️ Fichiers Docker

- [docker-compose.yml](docker-compose.yml) - Orchestration des services
- [backend/Dockerfile](backend/Dockerfile) - Image backend
- [Frontend/react/webapp/Dockerfile](Frontend/react/webapp/Dockerfile) - Image frontend (production)
- [Frontend/react/webapp/Dockerfile.dev](Frontend/react/webapp/Dockerfile.dev) - Image frontend (développement)

## ❓ Problèmes Courants

### Le backend ne démarre pas
```bash
docker-compose logs backend
docker-compose restart backend
```

### Port déjà utilisé
Modifiez les ports dans [docker-compose.yml](docker-compose.yml)

### Réinitialiser complètement
```bash
docker-compose down -v
docker-compose up -d --build
```

## 🔧 Configuration

### Variables d'environnement

**Frontend** ([Frontend/react/webapp/.env](Frontend/react/webapp/.env)):
```env
VITE_API_URL=http://localhost:8080/api
```

**Backend**: Configuré automatiquement via [docker-compose.yml](docker-compose.yml)

## 📊 Workflow de Développement

1. **Démarrer**: `docker-compose up -d`
2. **Coder**: Les modifications frontend sont hot-reloadées automatiquement
3. **Rebuild backend si nécessaire**: `docker-compose up -d --build backend`
4. **Arrêter**: `docker-compose down`

---

**🎉 C'est tout! Votre application est maintenant dockerisée et prête à l'emploi.**

Pour plus de détails, consultez [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
