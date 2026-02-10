import { useState, useEffect } from "react";
import { registerApi, getUsersApi } from "./api";
import { useProfile } from "./ProfileContext";
import { useNavigate } from "react-router-dom";

// Composant Toast pour les notifications
const Toast = ({ message, type, onClose }) => {
  const bgColors = {
    success: 'linear-gradient(135deg, #28a745, #20c997)',
    error: 'linear-gradient(135deg, #dc3545, #e74c3c)',
    warning: 'linear-gradient(135deg, #ffc107, #fd7e14)',
    info: 'linear-gradient(135deg, #17a2b8, #3498db)'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 10000,
      minWidth: 350,
      maxWidth: 500,
      background: bgColors[type] || bgColors.info,
      color: 'white',
      padding: '18px 25px',
      borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      animation: 'slideIn 0.4s ease-out',
      fontWeight: 500
    }}>
      <span style={{ fontSize: '2rem' }}>{icons[type]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 5 }}>
          {type === 'success' ? 'Succès !' : type === 'error' ? 'Erreur !' : type === 'warning' ? 'Attention' : 'Info'}
        </div>
        <div style={{ fontSize: '0.95rem', opacity: 0.95 }}>{message}</div>
      </div>
      <button 
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          width: 30,
          height: 30,
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >×</button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

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
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error'|'warning'|'info' }
  const token = localStorage.getItem("token");

  // URL de base pour l'API - utilise le proxy Vite en dev
  const API_BASE = '/api';

  // Fonction utilitaire pour afficher un toast
  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type });
    if (duration > 0) {
      setTimeout(() => setToast(null), duration);
    }
  };

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

  // Récupérer les informations de debug Firebase
  const fetchFirebaseDebugInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/firebase-sync-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const debugData = await response.json();
        setDebugInfo(debugData);
      } else {
        console.error('Erreur lors de la récupération du debug Firebase');
      }
    } catch (error) {
      console.error('Erreur debug Firebase:', error);
    }
  };

  // Synchroniser tous les utilisateurs vers Firebase
  const syncAllUsers = async () => {
    setSyncing(true);
    setSyncResult(null);
    setErrorMessage('');
    showToast('🔄 Synchronisation en cours... Veuillez patienter.', 'info', 0);
    
    try {
      const response = await fetch(`${API_BASE}/auth/sync-users-to-firebase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setSyncResult(result);
      
      if (result.success) {
        showToast(
          `Synchronisation Firebase réussie ! ${result.syncedUsers || 0}/${result.eligibleUsers || 0} utilisateurs synchronisés vers Firebase.`,
          'success',
          8000
        );
        setSuccessMessage(`🔥 Synchronisation Firebase réussie ! ${result.syncedUsers}/${result.eligibleUsers} utilisateurs 'user' synchronisés.`);
        // Recharger la liste des utilisateurs et les infos debug
        await loadUsers();
        if (showDebug) {
          await fetchFirebaseDebugInfo();
        }
      } else {
        showToast(`Échec de la synchronisation Firebase: ${result.message}`, 'error', 10000);
        setErrorMessage(`❌ Erreur de synchronisation Firebase: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      showToast('Erreur de connexion au serveur lors de la synchronisation', 'error', 10000);
      setErrorMessage('❌ Erreur lors de la synchronisation Firebase');
    } finally {
      setSyncing(false);
      // Masquer les messages après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
        setSyncResult(null);
      }, 5000);
    }
  };

  // Mot de passe temporaire pour la synchronisation Firebase
  const TEMP_PASSWORD = 'Temp123!';

  // Synchroniser un utilisateur spécifique (uniquement rôle 'user')
  const syncSingleUser = async (userId, email, userRole) => {
    // Ne synchroniser que les utilisateurs avec le rôle 'user'
    if (userRole !== 'user') {
      showToast(`Seuls les utilisateurs avec le rôle 'user' peuvent être synchronisés`, 'warning', 4000);
      setErrorMessage(`⚠️ Seuls les utilisateurs avec le rôle 'user' peuvent être synchronisés vers Firebase`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    showToast(`Synchronisation de ${email} en cours...`, 'info', 0);

    try {
      const response = await fetch(`${API_BASE}/auth/sync-user-to-firebase/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: TEMP_PASSWORD }) // Mot de passe temporaire fixe
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast(`✅ ${email} synchronisé ! Mot de passe mobile: ${TEMP_PASSWORD}`, 'success', 10000);
        setSuccessMessage(`🔥 Utilisateur ${email} synchronisé vers Firebase ! Mot de passe temporaire: ${TEMP_PASSWORD}`);
        // Recharger la liste
        await loadUsers();
        if (showDebug) {
          await fetchFirebaseDebugInfo();
        }
      } else {
        showToast(`Échec sync ${email}: ${result.message}`, 'error', 8000);
        setErrorMessage(`❌ Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast(`Erreur de connexion lors de la synchronisation de ${email}`, 'error', 8000);
      setErrorMessage('❌ Erreur lors de la synchronisation individuelle');
    }
    
    // Masquer les messages après 5 secondes
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  // Créer un nouvel utilisateur ET le synchroniser automatiquement vers Firebase
  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showToast("Veuillez remplir tous les champs", 'warning', 4000);
      setErrorMessage("⚠️ Veuillez remplir tous les champs");
      return;
    }
    
    setCreatingUser(true);
    setErrorMessage('');
    setSuccessMessage('');
    showToast(`Création de l'utilisateur ${newUserEmail}...`, 'info', 0);
    
    try {
      // Créer l'utilisateur en base PostgreSQL
      await registerApi(newUserEmail, newUserPassword, newUserRole);
      
      setSuccessMessage(`✅ Utilisateur ${newUserEmail} créé avec succès !`);
      
      // Recharger la liste des utilisateurs
      await loadUsers();
      
      // AUTO-SYNC: Synchroniser automatiquement vers Firebase (seulement si rôle = 'user')
      if (newUserRole === 'user') {
        showToast(`Synchronisation Firebase de ${newUserEmail}...`, 'info', 0);
        try {
          const updatedUsers = await getUsersApi(token);
          const newUser = updatedUsers.find(u => u.email === newUserEmail);
          
          if (newUser) {
            const response = await fetch(`${API_BASE}/auth/sync-user-to-firebase/${newUser.id}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ password: 'temp_password_123' }) // Mot de passe temporaire
            });
            
            const syncResult = await response.json();
            
            if (syncResult.success) {
              showToast(`Utilisateur ${newUserEmail} créé `, 'success', 8000);
              setSuccessMessage(`✅🔥 Utilisateur ${newUserEmail} créé avec succès !`);
            } else {
              showToast(`Utilisateur créé mais sync Firebase échouée: ${syncResult.message}`, 'warning', 8000);
              setSuccessMessage(`✅ Utilisateur ${newUserEmail} créé, mais échec sync Firebase: ${syncResult.message}`);
            }
          }
        } catch (syncError) {
          console.error('Erreur sync Firebase post-création:', syncError);
          showToast(`Utilisateur créé mais erreur de synchronisation Firebase`, 'warning', 8000);
          setSuccessMessage(`✅ Utilisateur ${newUserEmail} créé, mais échec de synchronisation Firebase`);
        }
      } else {
        showToast(`Utilisateur ${newUserEmail} (${newUserRole}) créé avec succès !`, 'success', 6000);
        setSuccessMessage(`✅ Utilisateur ${newUserEmail} créé avec succès !`);
      }
      
      // Réinitialiser le formulaire
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      
      // Masquer le message après 4 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      showToast(err.message || "Erreur lors de la création", 'error', 8000);
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
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
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

        {/* Section Synchronisation Firebase */}
        <div style={{
          background: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: 12,
          padding: '30px',
          marginBottom: 40,
          color: '#2c3e50',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{margin: '0 0 10px 0', fontSize: '1.5rem', color: '#2c3e50'}}>🔥 Synchronisation Firebase</h2>
          <p style={{margin: '0 0 25px 0', color: '#666'}}>Synchroniser uniquement les utilisateurs avec le rôle 'user' vers Firebase Auth pour l'application mobile</p>
          
          <div style={{display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap'}}>
            <button
              onClick={syncAllUsers}
              disabled={syncing || loadingUsers}
              style={{
                padding: '12px 24px',
                borderRadius: 25,
                border: '2px solid #3498db',
                background: syncing ? '#bdc3c7' : '#3498db',
                color: 'white',
                fontWeight: 600,
                cursor: (syncing || loadingUsers) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '1rem',
                transition: 'all 0.3s'
              }}
            >
              {syncing ? '⏳ Synchronisation...' : '🔄 Synchroniser tous les utilisateurs (rôle "user" uniquement)'}
            </button>
            
            <button
              onClick={async () => {
                setShowDebug(!showDebug);
                if (!showDebug) {
                  await fetchFirebaseDebugInfo();
                }
              }}
              disabled={syncing || loadingUsers}
              style={{
                padding: '10px 20px',
                borderRadius: 20,
                border: '2px solid #17a2b8',
                background: showDebug ? '#17a2b8' : 'white',
                color: showDebug ? 'white' : '#17a2b8',
                fontWeight: 500,
                cursor: (syncing || loadingUsers) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.3s'
              }}
            >
              {showDebug ? '🔍 Masquer Debug' : '🔍 Debug Firebase'}
            </button>
            
            {users.length > 0 && (
              <div style={{
                padding: '8px 16px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: 20,
                fontSize: '0.9rem',
                color: '#495057'
              }}>
                📈 {users.filter(u => u.role === 'user').length} utilisateur{users.filter(u => u.role === 'user').length > 1 ? 's' : ''} 'user' à synchroniser sur {users.length} total
              </div>
            )}
          </div>
          
          {syncResult && (
            <div style={{
              marginTop: 20,
              padding: '15px',
              background: syncResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              borderRadius: 8,
              border: `2px solid ${syncResult.success ? '#4caf50' : '#f44336'}`,
              color: syncResult.success ? '#2e7d32' : '#c62828'
            }}>
              <h4 style={{margin: '0 0 8px 0'}}>
                {syncResult.success ? '✅ Synchronisation réussie !' : '❌ Erreur de synchronisation'}
              </h4>
              <p style={{margin: 0, fontSize: '0.9rem', opacity: 0.9}}>
                {syncResult.message}
              </p>
              {syncResult.totalUsers && (
                <p style={{margin: '8px 0 0 0', fontSize: '0.9rem', fontWeight: 600}}>
                  📈 Résultat: {syncResult.syncedUsers}/{syncResult.totalUsers} utilisateurs synchronisés
                </p>
              )}
            </div>
          )}
          
          <div style={{
            marginTop: 20,
            padding: '15px',
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: 8,
            fontSize: '0.9rem',
            border: '2px solid #ffc107',
            color: '#856404'
          }}>
            ⚠️ <strong>Important:</strong> Seuls les utilisateurs avec le rôle "user" seront synchronisés. La synchronisation génère des mots de passe temporaires et envoie des emails de réinitialisation.
          </div>
        </div>

        {/* Section Debug Firebase */}
        {showDebug && (
          <div style={{
            background: '#f8f9fa',
            border: '2px solid #17a2b8',
            borderRadius: 12,
            padding: '25px',
            marginBottom: 40,
            color: '#2c3e50'
          }}>
            <h3 style={{margin: '0 0 20px 0', color: '#17a2b8', display: 'flex', alignItems: 'center', gap: 10}}>
              🔍 Debug Firebase - État des Synchronisations
              <button
                onClick={fetchFirebaseDebugInfo}
                style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  border: '1px solid #17a2b8',
                  background: 'white',
                  color: '#17a2b8',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Actualiser
              </button>
            </h3>
            
            {debugInfo ? (
              <div>
                {/* Statistiques */}
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 25}}>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #dee2e6'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#495057'}}>{debugInfo.stats.totalUsers}</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Total Utilisateurs</div>
                  </div>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #28a745'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745'}}>{debugInfo.stats.eligibleUsers}</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Éligibles (rôle "user")</div>
                  </div>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #007bff'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff'}}>{debugInfo.stats.syncedUsers}</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Synchronisés Firebase</div>
                  </div>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #ffc107'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#e67e22'}}>{debugInfo.stats.pendingUsers}</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>En Attente</div>
                  </div>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #dc3545'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545'}}>{debugInfo.stats.errorUsers}</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Erreurs</div>
                  </div>
                  <div style={{background: 'white', padding: 15, borderRadius: 8, textAlign: 'center', border: '1px solid #6f42c1'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#6f42c1'}}>{debugInfo.stats.syncPercentage}%</div>
                    <div style={{fontSize: '0.9rem', color: '#6c757d'}}>Taux de Sync</div>
                  </div>
                </div>

                {/* Message de diagnostic */}
                <div style={{
                  background: debugInfo.stats.syncedUsers === debugInfo.stats.eligibleUsers ? '#d4edda' : 
                            debugInfo.stats.syncedUsers === 0 ? '#f8d7da' : '#fff3cd',
                  border: `2px solid ${debugInfo.stats.syncedUsers === debugInfo.stats.eligibleUsers ? '#28a745' : 
                                      debugInfo.stats.syncedUsers === 0 ? '#dc3545' : '#ffc107'}`,
                  borderRadius: 8,
                  padding: 15,
                  marginBottom: 20
                }}>
                  <strong>Diagnostic:</strong>
                  {debugInfo.stats.syncedUsers === debugInfo.stats.eligibleUsers ? (
                    <span style={{color: '#155724'}}> ✅ Tous les utilisateurs "user" sont synchronisés avec Firebase ! Les connexions mobiles devraient fonctionner.</span>
                  ) : debugInfo.stats.syncedUsers === 0 ? (
                    <span style={{color: '#721c24'}}> ❌ Aucun utilisateur synchronisé ! Cliquer sur "Synchroniser tous les utilisateurs" pour résoudre.</span>
                  ) : (
                    <span style={{color: '#856404'}}> ⚠️ Synchronisation partielle. {debugInfo.stats.pendingUsers} utilisateurs restent à synchroniser.</span>
                  )}
                </div>

                {/* Tableau détaillé */}
                <div style={{overflowX: 'auto'}}>
                  <h4 style={{margin: '0 0 15px 0', color: '#495057'}}>Détail par Utilisateur</h4>
                  <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden'}}>
                    <thead style={{background: '#e9ecef'}}>
                      <tr>
                        <th style={{padding: 10, textAlign: 'left', border: '1px solid #dee2e6'}}>Email</th>
                        <th style={{padding: 10, textAlign: 'left', border: '1px solid #dee2e6'}}>Rôle</th>
                        <th style={{padding: 10, textAlign: 'center', border: '1px solid #dee2e6'}}>Éligible</th>
                        <th style={{padding: 10, textAlign: 'center', border: '1px solid #dee2e6'}}>Statut</th>
                        <th style={{padding: 10, textAlign: 'left', border: '1px solid #dee2e6'}}>Firebase UID</th>
                        <th style={{padding: 10, textAlign: 'left', border: '1px solid #dee2e6'}}>Sync Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugInfo.userDetails.map(user => (
                        <tr key={user.id} style={{borderBottom: '1px solid #dee2e6'}}>
                          <td style={{padding: 10, border: '1px solid #dee2e6'}}>{user.email}</td>
                          <td style={{padding: 10, border: '1px solid #dee2e6'}}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: 10,
                              fontSize: '0.8rem',
                              background: user.role === 'user' ? '#d4edda' : '#e2e3e5',
                              color: user.role === 'user' ? '#155724' : '#6c757d'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{padding: 10, textAlign: 'center', border: '1px solid #dee2e6'}}>
                            {user.eligible ? '✅' : '❌'}
                          </td>
                          <td style={{padding: 10, textAlign: 'center', border: '1px solid #dee2e6'}}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: 12,
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              background: 
                                user.synced ? '#d4edda' :
                                user.syncStatus === 'SYNC_ERROR' ? '#f8d7da' :
                                user.eligible ? '#fff3cd' : '#e2e3e5',
                              color:
                                user.synced ? '#155724' :
                                user.syncStatus === 'SYNC_ERROR' ? '#721c24' :
                                user.eligible ? '#856404' : '#6c757d'
                            }}>
                              {user.synced ? 'SYNCÉ' :
                               user.syncStatus === 'SYNC_ERROR' ? 'ERREUR' :
                               user.eligible ? 'EN ATTENTE' : 'NON ÉLIGIBLE'}
                            </span>
                          </td>
                          <td style={{padding: 10, border: '1px solid #dee2e6', fontSize: '0.8rem', color: '#6c757d'}}>
                            {user.firebaseUid !== 'null' ? user.firebaseUid.substring(0, 20) + '...' : '-'}
                          </td>
                          <td style={{padding: 10, border: '1px solid #dee2e6', fontSize: '0.8rem', color: '#6c757d'}}>
                            {user.syncedAt !== 'null' ? new Date(user.syncedAt).toLocaleString('fr-FR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: 20, color: '#6c757d'}}>
                ⏳ Chargement des informations de debug...
              </div>
            )}
          </div>
        )}

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
