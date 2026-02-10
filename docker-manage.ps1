# Scripts de gestion Docker
# Pour Windows PowerShell

Write-Host "=== Gestionnaire Docker Cloud ===" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "1. Démarrer tous les services" -ForegroundColor Green
    Write-Host "2. Arrêter tous les services" -ForegroundColor Yellow
    Write-Host "3. Voir les logs" -ForegroundColor Blue
    Write-Host "4. Rebuild et redémarrer" -ForegroundColor Magenta
    Write-Host "5. Voir l'état des services" -ForegroundColor Cyan
    Write-Host "6. Accéder au shell du backend" -ForegroundColor White
    Write-Host "7. Accéder à PostgreSQL" -ForegroundColor White
    Write-Host "8. Nettoyer et réinitialiser" -ForegroundColor Red
    Write-Host "9. Quitter" -ForegroundColor Gray
    Write-Host ""
}

do {
    Show-Menu
    $choice = Read-Host "Choisissez une option"
    
    switch ($choice) {
        "1" {
            Write-Host "Démarrage des services..." -ForegroundColor Green
            docker-compose up -d
            Write-Host "Services démarrés! Accédez à:" -ForegroundColor Green
            Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Cyan
            Write-Host "  - Backend API: http://localhost:8080/api" -ForegroundColor Cyan
            Write-Host "  - Health Check: http://localhost:8080/api/health" -ForegroundColor Cyan
        }
        "2" {
            Write-Host "Arrêt des services..." -ForegroundColor Yellow
            docker-compose down
            Write-Host "Services arrêtés!" -ForegroundColor Green
        }
        "3" {
            Write-Host "Affichage des logs (Ctrl+C pour quitter)..." -ForegroundColor Blue
            docker-compose logs -f
        }
        "4" {
            Write-Host "Rebuild et redémarrage..." -ForegroundColor Magenta
            docker-compose down
            docker-compose up -d --build
            Write-Host "Services rebuilt et redémarrés!" -ForegroundColor Green
        }
        "5" {
            Write-Host "État des services:" -ForegroundColor Cyan
            docker-compose ps
            Write-Host ""
            Write-Host "Statistiques:" -ForegroundColor Cyan
            docker stats --no-stream
        }
        "6" {
            Write-Host "Connexion au backend..." -ForegroundColor White
            docker exec -it cloud_backend sh
        }
        "7" {
            Write-Host "Connexion à PostgreSQL..." -ForegroundColor White
            docker exec -it cloud_postgres psql -U postgres -d cloud
        }
        "8" {
            $confirm = Read-Host "⚠️  Cela supprimera TOUTES les données. Continuer? (oui/non)"
            if ($confirm -eq "oui") {
                Write-Host "Nettoyage complet..." -ForegroundColor Red
                docker-compose down -v
                docker system prune -af
                Write-Host "Nettoyage terminé!" -ForegroundColor Green
            }
        }
        "9" {
            Write-Host "Au revoir!" -ForegroundColor Gray
            break
        }
        default {
            Write-Host "Option invalide!" -ForegroundColor Red
        }
    }
    
    if ($choice -ne "9") {
        Write-Host ""
        Read-Host "Appuyez sur Entrée pour continuer"
        Clear-Host
    }
} while ($choice -ne "9")
