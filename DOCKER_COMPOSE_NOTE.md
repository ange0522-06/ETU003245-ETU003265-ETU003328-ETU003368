# ⚠️ Note importante sur Docker Compose

## Deux versions de Docker Compose

Il existe deux versions de la commande Docker Compose:

### 1. Docker Compose V1 (ancien - ne fonctionne pas toujours)
```bash
docker-compose up -d
```
⚠️ Si vous voyez des erreurs Python/KeyboardInterrupt, utilisez V2 ci-dessous.

### 2. Docker Compose V2 (recommandé - intégré à Docker)
```bash
docker compose up -d    # Noter l'absence de trait d'union
```

## 🔧 Comment savoir quelle version utiliser?

Testez ces commandes:

```powershell
# Test V1
docker-compose version

# Test V2
docker compose version
```

Utilisez celle qui fonctionne !

## 📝 Commandes corrigées

Si `docker-compose` ne fonctionne pas, remplacez simplement par `docker compose`:

**Au lieu de:**
```bash
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose ps
```

**Utilisez:**
```bash
docker compose up -d
docker compose down
docker compose logs -f
docker compose ps
```

## 🚀 Démarrage de votre application

Choisissez la commande qui fonctionne pour vous:

### Option A: Docker Compose V2 (recommandé)
```powershell
docker compose up -d
```

### Option B: Docker Compose V1
```powershell
docker-compose up -d
```

### Option C: Script de gestion (détecte automatiquement)
```powershell
# Windows
.\docker-manage.ps1

# Linux/Mac
./docker-manage.sh
```

## 🎯 Tableau de correspondance rapide

| Action | V1 (ancien) | V2 (nouveau) |
|--------|-------------|--------------|
| Démarrer | `docker-compose up -d` | `docker compose up -d` |
| Arrêter | `docker-compose down` | `docker compose down` |
| Logs | `docker-compose logs -f` | `docker compose logs -f` |
| Status | `docker-compose ps` | `docker compose ps` |
| Rebuild | `docker-compose up -d --build` | `docker compose up -d --build` |

## ✅ Solution recommandée

**Utilisez Docker Compose V2** (sans trait d'union) car:
- ✅ Intégré directement dans Docker
- ✅ Plus rapide
- ✅ Mieux maintenu
- ✅ Compatible avec les dernières fonctionnalités

## 💡 Mise à jour pour utiliser V2

Si vous avez Docker Desktop, V2 est déjà installé. Utilisez simplement:

```powershell
docker compose <command>
```

---

**En résumé**: Remplacez `docker-compose` (avec trait d'union) par `docker compose` (avec espace) dans toutes les commandes.
