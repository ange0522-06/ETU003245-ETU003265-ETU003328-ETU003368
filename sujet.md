Objectifs
• Mettre en place un projet de fournisseur 
d’identité sur un des plateformes suivantes 
(docker) :– Php mvc (pas de flightPhp)– Java– .Net– Node Js
• API seulement (pas d’interface)
Confidential - Not for Public Consumption or Distribution
Module Authentification
• On utilise Firebase s’il y a une connexion 
Internet ou une Base local (postgres) dans 
docker (si pas de connexion)
• Ci-dessous les fonctionnalités minimales– Authentification (email/pwd) – Inscription– Modification infos users
Confidential - Not for Public Consumption or Distribution
Module Authentification
• Ci-dessous les fonctionnalités minimales– Durée de vie des sessions– Limite des nombres ( paramétrable, par défaut 3 ) 
de tentatives de connexion pour un compte
• Un API REST peut réinitialiser le blocage pour un 
utilisateur donné – Documentation API via Swagger
Confidential - Not for Public Consumption or Distribution
Module Cartes
• Installer un serveur de carte Offline sur Docker
• Télécharger la ville d’Antananarivo avec les 
rues
• Utiliser leaflet pour afficher/manipuler la carte 
dans l’application web
Confidential - Not for Public Consumption or Distribution
Confidential - Not for Public Consumption or Distribution
Module Web
•C’est une application qui permet de suivre les 
travaux routiers sur la ville d’Antananarivo 
pour les visiteurs et de gérer les données pour 
le manager
Module Web
• Utiliser l’API Rest Authentification pour se 
logguer et créer un compte
•2 profils– Visiteur (sans compte)– Manager (compte à créer par défaut )
Confidential - Not for Public Consumption or Distribution
Confidential - Not for Public Consumption or Distribution
Module Web
•Visiteurs–Voir la carte avec les différents points 
représentants les problèmes routiers
Module Web
• Visiteurs– Lorsqu’on survole un point, on doit voir les infos 
sur le problème ( date, status (nouveau, en cours, 
terminé), surface en m2, budget, entreprise 
concerné, 
un lien pour voir les photos)– Voir le tableau de récapitulation actuel ( Nb de 
point, total surface, avancement en %, total 
budget)
Confidential - Not for Public Consumption or Distribution
Module Web
• Manager–Cr
éation d’un compte utilisateur– Bouton synchronisation
• Récupérer les signalements en ligne (firebase)
• Envoi les données nécessaires en ligne (firebase) pour un 
affichage sur mobile– Page pour débloquer les utilisateurs bloqués– gestion des infos nécessaires sur chaque signalement 
(surface en m2, budget, entreprise concerné, …)– Modifier les statuts de chaque signalement
Confidential - Not for Public Consumption or Distribution
Module Web(2)
• Manager– Pour calculer l’avancement
• nouveau = 0%
• en cours = 50%
• terminé = 100%– Pour chaque étape d’avancement , on spécifie les 
dates– Créer un tableau de statistiques pour voir le 
traitement moyen des travaux
Confidential - Not for Public Consumption or Distribution
Confidential - Not for Public Consumption or Distribution
Module Mobile
•Utilisateurs –Se loguer sur firebase en ligne (inscription via le manager 
dans l’application web uniquement)–Signaler les problèmes routiers à partir du map (utiliser 
leaflet et openstreetmap en ligne)
•Localisation 
•Ajouter 1 ou plusieurs photos–Afficher la carte et recap (cf fonctionnalités visiteurs)–Mettre un filtre : afficher mes signalements uniquement–Recevoir une notification à chaque changement de status 
de mes signalements
