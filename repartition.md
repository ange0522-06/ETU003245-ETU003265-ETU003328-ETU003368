cd backend
mvn spring-boot:run

'Personne 1 – Responsable Authentification & API (Backend)
🎯 Rôle principal

Mettre en place le fournisseur d’identité et sécuriser l’accès à toutes les applications via une API REST.

🛠️ Tâches détaillées

Choisir et configurer la technologie backend
👉 (Java / NodeJS / .NET / PHP MVC – API only, pas d’interface)

Mise en place de l’authentification

Inscription (email / mot de passe)

Connexion'

-- Modification des informations utilisateur

-- Gestion Firebase (en ligne) et PostgreSQL en local (Docker)

-- Détection connexion Internet

-- Bascule automatique Firebase ↔ Base locale

-- Gestion de la sécurité

-- Durée de vie des sessions

--Limitation des tentatives de connexion (par défaut : 3)

'Blocage automatique du compte

API REST pour débloquer un utilisateur

Documentation de l’API avec Swagger

Mise en place du projet dans Docker

Fournir les endpoints nécessaires aux modules Web et Mobile

📦 Livrables :

API REST fonctionnelle

Swagger

Docker (API + Postgres)

Code sur GitHub / GitLab'

--fini : 
✔ Inscription
✔ Connexion
✔ Hash mot de passe
✔ API testable (Postman)
---
✔ Auth persistante
✔ PostgreSQL opérationnel
✔ JPA configuré
✔ Base prête pour JWT


👤 Personne 2 – Responsable Cartographie & Serveur de cartes
🎯 Rôle principal

Gérer toute la partie cartes, offline et online.

🛠️ Tâches détaillées

Installation d’un serveur de cartes offline dans Docker

Téléchargement et configuration de la carte d’Antananarivo

Rues

Données OpenStreetMap

Mise en place de Leaflet


Affichage de la carte

Gestion des marqueurs (points de signalement)

Préparer les fonctions réutilisables pour :

Web

Mobile

Optimisation de l’affichage (zoom, déplacement, interactions)

Aider à l’intégration carte ↔ signalements

📦 Livrables :

Serveur de cartes Dockerisé

Carte offline Antananarivo

Composants Leaflet prêts à l’emploi

Documentation technique carte

'👤 Personne 3 – Responsable Application Web
🎯 Rôle principal

Développer l’application Web de signalement et de suivi des travaux routiers.

🛠️ Tâches détaillées

Choisir un framework Web
👉 React / Angular / VueJS (différent du mobile)

Intégration de l’API Authentification

Gestion des profils

Visiteur

Utilisateur

Manager

Fonctionnalités Visiteur

Affichage de la carte

Visualisation des points

Infos au survol (date, statut, surface, budget, entreprise)

Tableau récapitulatif :

Nombre de points

Surface totale

Avancement (%)

Budget total

Fonctionnalités Manager

Bouton de synchronisation Firebase

Déblocage des utilisateurs

Gestion des infos des signalements

Modification du statut des travaux

Design et ergonomie

Connexion avec le module cartes

📦 Livrables :

Application Web fonctionnelle

Gestion complète des rôles

Design propre

Code versionné'

👤 Personne 4 – Responsable Application Mobile & Documentation
🎯 Rôle principal

Développer l’application mobile Ionic et gérer la documentation & suivi du projet.

🛠️ Tâches détaillées
📱 Application Mobile

Développement avec Ionic

Connexion Firebase (en ligne)

Authentification utilisateur

Signalement des problèmes routiers

Localisation GPS

Carte en ligne (Leaflet + OpenStreetMap)

Affichage :

Carte

Récapitulatif global

Filtre : mes signalements uniquement

Génération de l’APK

📄 Documentation & Suivi

Rédaction de la documentation technique

Présentation du projet

MCD

Scénarios d’utilisation avec captures d’écran

Suivi des tâches (Trello, GitHub Projects, etc.)

Vérification des livrables finaux

Centralisation des infos du groupe (noms, NumETU)

📦 Livrables :

Application mobile

APK

Documentation complète

Suivi de projet



