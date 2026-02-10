# 🚀 Guide de lancement du projet — Gestion Routière

## Prérequis

- **Docker Desktop** installé et **démarré** (https://www.docker.com/products/docker-desktop)
- **Git** (pour cloner le projet)
- Connexion internet (pour le premier build uniquement)

---

## 1. Lancer le projet

Ouvrir un terminal à la **racine du projet** (`ETU003245-ETU003265-ETU003328-ETU003368/`) puis :

```bash
docker compose up -d --build
```

> ⏳ Le premier lancement prend **3-5 min** (téléchargement des images + compilation).
> Les lancements suivants sont quasi-instantanés.

---

## 2. Vérifier que tout tourne

```bash
docker compose ps
```

Résultat attendu : 3 services **running** (+ tileserver si données de carte présentes) :

| Service            | Port               | Description                     |
|--------------------|--------------------|---------------------------------|
| cloud_postgres     | localhost:**5433**  | Base de données PostgreSQL 15   |
| cloud_backend      | localhost:**8080**  | API Spring Boot (Java 17)       |
| cloud_frontend_dev | localhost:**5173**  | Frontend React (Vite dev)       |
| tileserver         | localhost:**8085**  | Serveur de tuiles carte         |

---

## 3. Accéder à l'application

| Quoi                  | URL                              |
|-----------------------|----------------------------------|
| **Application web**   | http://localhost:5173             |
| **API Backend**       | http://localhost:8080/api/health  |
| **Carte (tuiles)**    | http://localhost:8085             |

---

## 4. Créer le premier compte (base vide au démarrage)

La base de données Docker est **vide** au premier lancement.

**Option A : Via l'interface web**
1. Ouvrir http://localhost:5173
2. Créer un compte **manager** (le premier compte créé)

**Option B : Via Postman / curl**

```bash
# Créer le manager
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@email.com","password":"1234","role":"manager"}'

# Se connecter
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@email.com","password":"1234"}'
```

---

## 5. Commandes utiles

```bash
# Voir les logs du backend
docker logs cloud_backend -f

# Voir les logs de tous les services
docker compose logs -f

# Arrêter tous les services
docker compose down

# Arrêter et SUPPRIMER les données (reset complet)
docker compose down -v

# Rebuild après modification du code backend
docker compose up -d --build backend

# Accéder à la base PostgreSQL
docker exec -it cloud_postgres_docker psql -U postgres -d cloud
```

---

## 6. Structure des services

```
ETU003245-ETU003269-ETU003328-ETU003368/
├── docker-compose.yml          ← Orchestration des services
├── backend/                    ← API Spring Boot (Java 17)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── Frontend/react/webapp/      ← Interface React (Vite)
│   ├── Dockerfile.dev
│   ├── package.json
│   └── src/
├── carto-server/               ← Config serveur de carte
│   └── config/
└── data/                       ← Données cartographiques (.mbtiles)
```

---

## 7. En cas de problème

| Problème                        | Solution                                                    |
|---------------------------------|-------------------------------------------------------------|
| Port 5432 déjà utilisé         | Normal, Docker utilise le port **5433** en externe          |
| Port 8080 occupé               | Arrêter le service local : `docker compose down` puis retry |
| Build échoue (réseau)          | Vérifier la connexion internet + DNS Docker                 |
| Backend "unhealthy"            | Attendre 60s (start_period) ou voir `docker logs cloud_backend` |
| Base de données vide           | C'est normal au 1er lancement, créer un compte via l'app    |

---

## 8. Identifiants par défaut

| Élément    | Valeur          |
|------------|-----------------|
| DB Name    | `cloud`         |
| DB User    | `postgres`      |
| DB Pass    | `18/20`         |
| DB Port    | `5433` (externe)|

---

> **Note :** Le frontend React a le **hot reload** activé — les modifications du code dans `Frontend/react/webapp/src/` sont reflétées automatiquement sans rebuild. Pour le backend, il faut rebuild : `docker compose up -d --build backend`

http://localhost:5173



