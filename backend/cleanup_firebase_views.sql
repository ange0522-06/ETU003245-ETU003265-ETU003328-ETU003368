-- Supprimer les vues qui bloquent la modification des colonnes
-- Exécuter ces commandes AVANT de relancer le backend

DROP VIEW IF EXISTS firebase_sync_stats CASCADE;
DROP VIEW IF EXISTS users_firebase_status CASCADE;

-- Confirmer la suppression
SELECT 'Vues supprimées avec succès' as status;
