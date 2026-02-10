## Tasks
- [x] Add pagination to RecapTable.vue to display pages at the bottom
- [ ] Modify "Mes signalements" button in MapPage.vue to show details modal instead of just filtering
- [ ] Create a modal component for displaying user's reports details
- [ ] Update MapPage.vue to handle the new details display functionality
- [ ] Test the pagination functionality
- [ ] Test the details display for "Mes signalements"
=======
# TODO: Fix RecapTable Pagination and Add Details for "Mes signalements"

## Tasks
- [x] Add pagination to RecapTable.vue to display pages at the bottom
- [x] Modify "Mes signalements" button in MapPage.vue to show details modal instead of just filtering
- [x] Create a modal component for displaying user's reports details
- [x] Update MapPage.vue to handle the new details display functionality
- [x] Test the pagination functionality
- [x] Test the details display for "Mes signalements"

_______________________________

Frontend: http://localhost:5173
Backend API: http://localhost:8080/api
Health Check: http://localhost:8080/api/health
PostgreSQL: localhost:5432

# À la racine du projet
docker compose up -d

# Test simple d'abord
docker pull hello-world

# Si ça marche, téléchargez les images du projet
docker pull postgres:15-alpine
docker pull maven:3.9-eclipse-temurin-17
docker pull eclipse-temurin:17-jre-alpine
docker pull node:20-alpine

# Puis relancez docker compose
docker compose up -d

# tester
docker compose exec postgres psql -U postgres -d cloud  