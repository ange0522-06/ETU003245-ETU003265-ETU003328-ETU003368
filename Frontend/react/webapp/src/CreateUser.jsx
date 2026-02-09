import { useState, useEffect } from "react";
import { registerApi, getUsersApi } from "./api";
import { useProfile } from "./ProfileContext";
import { useNavigate } from "react-router-dom";

export default function CreateUser() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [creatingUser, setCreatingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const token = localStorage.getItem("token");

  // Charger la liste des utilisateurs
  useEffect(() => {
    if (profile === "manager") {
      loadUsers();
    }
  }, [profile]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsersApi(token);
      setUsers(data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Créer un nouvel utilisateur
  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      setErrorMessage("⚠️ Veuillez remplir tous les champs");
      return;
    }
    
    setCreatingUser(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await registerApi(newUserEmail, newUserPassword, newUserRole);
      
      // Réinitialiser le formulaire
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setSuccessMessage(`✅ Utilisateur ${newUserEmail} créé avec succès !`);
      
      // Recharger la liste des utilisateurs
      await loadUsers();
      
      // Masquer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setCreatingUser(false);
    }
  };

  if (profile !== "manager") {
    return (
      <div className="manager-page">
        <div className="content-container" style={{textAlign: 'center', padding: '60px'}}>
          <div className="error-alert">
            <span style={{color:'#ff6b6b', fontSize: '3rem'}}>⛔</span>
            <h3 style={{color:'#ff6b6b', margin: '20px 0'}}>Accès réservé au manager</h3>
            <p style={{color:'#a0a0e0'}}>Vous devez être connecté en tant que manager pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1 className="page-title">
          Créer un utilisateur
        </h1>
        <p className="page-subtitle">
          Ajouter un nouvel utilisateur au système
        </p>
      </div>

      <div className="content-container">
        {successMessage && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '2px solid #4caf50',
            borderRadius: 8,
            padding: 15,
            marginBottom: 20,
            color: '#4caf50',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '2px solid #f44336',
            borderRadius: 8,
            padding: 15,
            marginBottom: 20,
            color: '#f44336',
            fontSize: '1rem',
            fontWeight: 500
          }}>
            {errorMessage}
          </div>
        )}

        {/* Formulaire de création */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: 40,
          maxWidth: 600,
          margin: '0 auto 40px auto'
        }}>
          <div style={{marginBottom: 25}}>
            <label style={{display: 'block', marginBottom: 10, color: '#2c3e50', fontWeight: 600, fontSize: '1rem'}}>
              📧 Email
            </label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="exemple@email.com"
              disabled={creatingUser}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 8,
                border: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                background: creatingUser ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{marginBottom: 25}}>
            <label style={{display: 'block', marginBottom: 10, color: '#2c3e50', fontWeight: 600, fontSize: '1rem'}}>
              🔒 Mot de passe
            </label>
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Mot de passe sécurisé"
              disabled={creatingUser}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 8,
                border: 'none',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                background: creatingUser ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          <div style={{marginBottom: 30}}>
            <label style={{display: 'block', marginBottom: 10, color: '#2c3e50', fontWeight: 600, fontSize: '1rem'}}>
              👥 Rôle
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              disabled={creatingUser}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 8,
                border: 'none',
                fontSize: '1rem',
                cursor: creatingUser ? 'not-allowed' : 'pointer',
                background: creatingUser ? '#f5f5f5' : 'white'
              }}
            >
              <option value="user">👤 Utilisateur</option>
              <option value="manager">👨‍💼 Manager</option>
            </select>
          </div>

          <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end'}}>
            <button
              onClick={() => navigate('/manager')}
              disabled={creatingUser}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'white',
                color: '#555',
                fontWeight: 600,
                cursor: creatingUser ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
            >
              Annuler
            </button>
            <button
              onClick={createUser}
              disabled={creatingUser}
              style={{
                padding: '12px 24px',
                borderRadius: 8,
                border: 'none',
                background: creatingUser ? '#9e9e9e' : '#9c27b0',
                color: 'white',
                fontWeight: 600,
                cursor: creatingUser ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
            >
              {creatingUser ? '⏳ Création en cours...' : '✅ Créer l\'utilisateur'}
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div style={{marginTop: 50}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#2c3e50'}}>
            👥 Liste des utilisateurs ({users.length})
          </h2>
          
          {loadingUsers ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p style={{marginTop: '20px'}}>Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
              Aucun utilisateur trouvé
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>📧 Email</th>
                    <th>👥 Rôle</th>
                    <th>🔒 Statut</th>
                    <th>📅 Dernière connexion</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background: user.role === 'manager' ? 'rgba(156, 39, 176, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                          color: user.role === 'manager' ? '#9c27b0' : '#2196f3'
                        }}>
                          {user.role === 'manager' ? '👨‍💼 Manager' : '👤 Utilisateur'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          background: user.locked ? 'rgba(244, 67, 54, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                          color: user.locked ? '#f44336' : '#4caf50'
                        }}>
                          {user.locked ? '🔒 Bloqué' : '✅ Actif'}
                        </span>
                      </td>
                      <td style={{color: '#666', fontSize: '0.9rem'}}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR') : 'Jamais connecté'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
