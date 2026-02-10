#!/bin/bash
# Scripts de gestion Docker pour Linux/Mac

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Gestionnaire Docker Cloud ===${NC}"
echo ""

show_menu() {
    echo -e "${GREEN}1.${NC} Démarrer tous les services"
    echo -e "${YELLOW}2.${NC} Arrêter tous les services"
    echo -e "${BLUE}3.${NC} Voir les logs"
    echo -e "${MAGENTA}4.${NC} Rebuild et redémarrer"
    echo -e "${CYAN}5.${NC} Voir l'état des services"
    echo -e "6. Accéder au shell du backend"
    echo -e "7. Accéder à PostgreSQL"
    echo -e "${RED}8.${NC} Nettoyer et réinitialiser"
    echo -e "9. Quitter"
    echo ""
}

while true; do
    show_menu
    read -p "Choisissez une option: " choice
    
    case $choice in
        1)
            echo -e "${GREEN}Démarrage des services...${NC}"
            docker-compose up -d
            echo -e "${GREEN}Services démarrés! Accédez à:${NC}"
            echo -e "${CYAN}  - Frontend: http://localhost:5173${NC}"
            echo -e "${CYAN}  - Backend API: http://localhost:8080/api${NC}"
            echo -e "${CYAN}  - Health Check: http://localhost:8080/api/health${NC}"
            ;;
        2)
            echo -e "${YELLOW}Arrêt des services...${NC}"
            docker-compose down
            echo -e "${GREEN}Services arrêtés!${NC}"
            ;;
        3)
            echo -e "${BLUE}Affichage des logs (Ctrl+C pour quitter)...${NC}"
            docker-compose logs -f
            ;;
        4)
            echo -e "${MAGENTA}Rebuild et redémarrage...${NC}"
            docker-compose down
            docker-compose up -d --build
            echo -e "${GREEN}Services rebuilt et redémarrés!${NC}"
            ;;
        5)
            echo -e "${CYAN}État des services:${NC}"
            docker-compose ps
            echo ""
            echo -e "${CYAN}Statistiques:${NC}"
            docker stats --no-stream
            ;;
        6)
            echo -e "Connexion au backend..."
            docker exec -it cloud_backend sh
            ;;
        7)
            echo -e "Connexion à PostgreSQL..."
            docker exec -it cloud_postgres psql -U postgres -d cloud
            ;;
        8)
            read -p "⚠️  Cela supprimera TOUTES les données. Continuer? (oui/non): " confirm
            if [ "$confirm" = "oui" ]; then
                echo -e "${RED}Nettoyage complet...${NC}"
                docker-compose down -v
                docker system prune -af
                echo -e "${GREEN}Nettoyage terminé!${NC}"
            fi
            ;;
        9)
            echo -e "Au revoir!"
            exit 0
            ;;
        *)
            echo -e "${RED}Option invalide!${NC}"
            ;;
    esac
    
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
    clear
done
