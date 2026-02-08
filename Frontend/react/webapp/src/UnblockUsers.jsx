import React, { useEffect, useState } from "react";
import { unblockUserApi, getUsersApi, testAuthAndRole } from "./api";

export default function UnblockUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    fetchAllUsers();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    
    if (!token) {
      setAuthStatus({
        authenticated: false,
        message: "Non authentifié - Aucun token"
      });
      return;
    }
    
    try {
      const status = await testAuthAndRole(token);
      setAuthStatus(status);
      console.log("Statut auth:", status);
    } catch (err) {
      setAuthStatus({
        authenticated: false,
        message: `Erreur vérification: ${err.message}`
      });
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo("");
    
    const token = localStorage.getItem("token");
    console.log("Token pour fetch:", token);
    
    if (!token) {
      setError("❌ Vous n'êtes pas connecté. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }
    
    try {
      // Vérifiez d'abord si vous êtes manager
      const authCheck = await testAuthAndRole(token);
      
      if (!authCheck.authenticated) {
        setError("❌ Authentification invalide. Veuillez vous reconnecter.");
        return;
      }
      
      if (!authCheck.isManager) {
        setError("⛔ Accès réservé aux managers seulement.");
        setDebugInfo(`Votre rôle: ${authCheck.user?.role || 'inconnu'}`);
        return;
      }
      
      setDebugInfo(`✅ Connecté en tant que ${authCheck.user?.role || 'manager'}`);
      
      // Maintenant, essayez de récupérer les utilisateurs
      const users = await getUsersApi(token);
      
      if (!Array.isArray(users)) {
        setDebugInfo(prev => prev + ` | Type réponse: ${typeof users}`);
        setUsers([]);
      } else {
        setUsers(users);
        setDebugInfo(prev => prev + ` | ${users.length} utilisateur(s)`);
      }
      
    } catch (err) {
      console.error("Erreur fetchAllUsers:", err);
      
      if (err.message.includes("403") || err.message.includes("Accès refusé")) {
        setError("⛔ Accès refusé par le serveur. Vérifiez que :");
        setDebugInfo(`
          1. Vous êtes connecté en tant que manager
          2. Le backend autorise l'accès à /api/users
          3. Votre token JWT est valide
          
          Token présent: ${token ? "OUI" : "NON"}
          Longueur token: ${token ? token.length : 0}
        `);
      } else {
        setError(`Erreur: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await unblockUserApi(userId, token);
      setSuccess("✅ Utilisateur débloqué avec succès !");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllUsers();
    } catch (err) {
      setError(`Erreur lors du déblocage: ${err.message}`);
    }
  };

  // Utilisateurs bloqués
  const blockedUsers = users.filter(user => 
    (user.field_attempts && user.field_attempts > 0) || 
    (user.locked === true) ||
    (user.blocked === true)
  );

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1 className="page-title">
          🔓 Déblocage des utilisateurs
        </h1>
        <p className="page-subtitle">
          Gérez les utilisateurs bloqués après trop de tentatives de connexion
        </p>
      </div>

      <div className="content-container">
        {/* Informations d'authentification */}
        {authStatus && (
          <div style={{
            background: authStatus.authenticated ? '#e8f5e9' : '#ffebee',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            borderLeft: `4px solid ${authStatus.authenticated ? '#4caf50' : '#f44336'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2em' }}>
                {authStatus.authenticated ? '✅' : '❌'}
              </span>
              <div>
                <strong>Statut d'authentification:</strong> {authStatus.message}
                {authStatus.user && (
                  <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                    Email: {authStatus.user.email || 'N/A'} | 
                    Rôle: <strong>{authStatus.user.role || 'inconnu'}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informations de débogage */}
        {debugInfo && (
          <div style={{
            background: '#e3f2fd',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '0.9em',
            color: '#1565c0',
            borderLeft: '4px solid #2196f3'
          }}>
            <strong>💡 Informations techniques:</strong>
            <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>
              {debugInfo}
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '16px',
            borderRadius: '6px',
            marginBottom: '20px',
            borderLeft: '4px solid #f44336'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.5em' }}>⚠️</span>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>Erreur</h3>
                <p style={{ margin: 0 }}>{error}</p>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Solutions possibles:</strong>
                  <ul style={{ margin: '8px 0 0 20px', fontSize: '0.9em' }}>
                    <li>Vérifiez que vous êtes connecté en tant que <strong>manager</strong></li>
                    <li>Déconnectez-vous et reconnectez-vous</li>
                    <li>Vérifiez que le backend est accessible sur http://localhost:8080</li>
                    <li>Contactez l'administrateur système</li>
                  </ul>
                </div>
                
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={fetchAllUsers}
                    style={{
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Réessayer
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    style={{
                      background: '#757575',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ↻ Recharger la page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            borderLeft: '4px solid #4caf50'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2em' }}>✅</span>
              <strong>{success}</strong>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        {!error && !loading && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>
                👥 Utilisateurs bloqués ({blockedUsers.length})
              </h2>
              <button 
                onClick={fetchAllUsers}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}
              >
                <span>🔄</span> Actualiser
              </button>
            </div>

            {blockedUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f5f5f5',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                <div style={{ fontSize: '4em', marginBottom: '15px' }}>✅</div>
                <h3 style={{ color: '#4caf50', marginBottom: '10px' }}>
                  Aucun utilisateur bloqué
                </h3>
                <p>Tous les utilisateurs peuvent se connecter normalement.</p>
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '15px' }}>
                  <strong>Note:</strong> {users.length} utilisateur(s) dans le système
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f1f8e9' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Rôle</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Tentatives</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Statut</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{user.id}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{user.role === 'manager' ? '👨‍💼' : '👤'}</span>
                            {user.email}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            background: user.role === 'manager' ? '#e3f2fd' : '#f3e5f5',
                            color: user.role === 'manager' ? '#1565c0' : '#7b1fa2',
                            fontSize: '0.85em',
                            fontWeight: '500'
                          }}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: user.field_attempts > 2 ? '#ff5722' : '#ff9800',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9em'
                          }}>
                            {user.field_attempts || 0}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: '#ffebee',
                            color: '#f44336',
                            fontWeight: '600',
                            fontSize: '0.85em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            🔒 Bloqué
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={() => handleUnblock(user.id)}
                            style={{
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '600'
                            }}
                          >
                            <span>🔓</span> Débloquer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="loading-spinner" style={{
              width: '50px',
              height: '50px',
              border: '5px solid #f3f3f3',
              borderTop: '5px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        )}
      </div>
    </div>
  );
}