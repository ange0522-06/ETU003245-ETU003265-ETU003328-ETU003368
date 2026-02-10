import React, { useState, useEffect } from 'react';

/*
🔄 FONCTIONNALITÉ DÉPLACÉE
========================
La synchronisation Firebase a été intégrée dans CreateUser.jsx
pour une meilleure expérience utilisateur.

✅ Nouvelle localisation: CreateUser.jsx
✅ Auto-sync lors de la création d'utilisateurs
✅ Boutons de synchronisation individuelle et globale
✅ Interface améliorée et intégrée

Ce fichier est conservé pour référence mais n'est plus utilisé.
*/

const UserSyncPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Charger la liste des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      } else {
        console.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Synchroniser tous les utilisateurs vers Firebase
  const syncAllUsers = async () => {
    setSyncing(true);
    setSyncResult(null);
    
    try {
      const response = await fetch('/api/auth/sync-users-to-firebase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setSyncResult(result);
      
      if (result.success) {
        alert(`Synchronisation réussie ! ${result.syncedUsers}/${result.totalUsers} utilisateurs synchronisés.`);
      } else {
        alert(`Erreur de synchronisation: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  // Synchroniser un utilisateur spécifique
  const syncSingleUser = async (userId, email) => {
    const password = prompt(`Entrez le mot de passe pour ${email}:`);
    if (!password) return;

    try {
      const response = await fetch(`/api/auth/sync-user-to-firebase/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Utilisateur ${email} synchronisé avec succès !`);
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la synchronisation');
    }
  };

  return (
    <div className="user-sync-page">
      <div className="header">
        <h1>🔄 Synchronisation Firebase</h1>
        <p>Synchroniser les utilisateurs PostgreSQL vers Firebase Auth</p>
      </div>

      <div className="sync-actions">
        <button 
          className="btn btn-primary"
          onClick={syncAllUsers}
          disabled={syncing}
        >
          {syncing ? '⏳ Synchronisation en cours...' : '🔄 Synchroniser tous les utilisateurs'}
        </button>
        
        <div className="sync-info">
          <p>⚠️ <strong>Important :</strong> La synchronisation générera des mots de passe temporaires et enverra des emails de réinitialisation.</p>
        </div>
      </div>

      {syncResult && (
        <div className={`sync-result ${syncResult.success ? 'success' : 'error'}`}>
          <h3>{syncResult.success ? '✅ Synchronisation réussie' : '❌ Erreur de synchronisation'}</h3>
          <p>{syncResult.message}</p>
          {syncResult.totalUsers && (
            <p>Résultat: {syncResult.syncedUsers}/{syncResult.totalUsers} utilisateurs synchronisés</p>
          )}
        </div>
      )}

      <div className="users-section">
        <h2>👥 Liste des utilisateurs ({users.length})</h2>
        
        {loading ? (
          <div className="loading">Chargement des utilisateurs...</div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={user.locked ? 'locked' : ''}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.locked ? (
                        <span className="status locked">🔒 Verrouillé</span>
                      ) : (
                        <span className="status active">✅ Actif</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => syncSingleUser(user.id, user.email)}
                        disabled={syncing}
                      >
                        🔄 Sync
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .user-sync-page {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .sync-actions {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }

        .sync-info {
          margin-top: 15px;
          padding: 10px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
        }

        .sync-result {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .sync-result.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .sync-result.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .btn-small {
          padding: 5px 10px;
          font-size: 12px;
          background-color: #6c757d;
          color: white;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .users-section h2 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .users-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        tr:hover {
          background-color: #f8f9fa;
        }

        tr.locked {
          background-color: #fff5f5;
        }

        .role {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-user { background-color: #e3f2fd; color: #1976d2; }
        .role-agent { background-color: #f3e5f5; color: #7b1fa2; }
        .role-manager { background-color: #e8f5e8; color: #388e3c; }
        .role-admin { background-color: #fff3e0; color: #f57c00; }

        .status.active { color: #28a745; }
        .status.locked { color: #dc3545; }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .user-sync-page {
            padding: 10px;
          }
          
          .sync-actions {
            padding: 15px;
          }
          
          table {
            font-size: 14px;
          }
          
          th, td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserSyncPage;