import { useState, useEffect } from "react";
import { getSignalementsApi, getUsersApi, blockUserApi, unblockUserApi, updateSignalementStatusApi, syncSignalementsToFirebase, getSignalementsFromFirebase } from "./api";
import { useProfile } from "./ProfileContext";

export default function Manager() {
  const { profile } = useProfile();
  const [signalements, setSignalements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const token = localStorage.getItem("token");

  // Synchronisation Firebase - Exporter vers Firebase
  const handleSyncToFirebase = async () => {
    setSyncing(true);
    try {
      const result = await syncSignalementsToFirebase(token);
      alert(`✅ ${result.exportedCount || 'Tous les'} signalements exportés vers Firebase !`);
    } catch (err) {
      alert(err.message || "Erreur lors de la synchronisation vers Firebase");
    } finally {
      setSyncing(false);
    }
  };

  // Synchronisation Firebase - Récupérer depuis Firebase
  const handleGetFromFirebase = async () => {
    setSyncing(true);
    try {
      const sig = await getSignalementsFromFirebase(token);
      // Mapper les champs Firebase vers le format frontend
      const mapped = sig.map(s => ({
        id: s.idSignalement || s.id,
        status: s.statut || s.status,
        date: s.dateSignalement ? s.dateSignalement.split('T')[0] : s.date || '',
        surface: s.surfaceM2 || s.surface,
        budget: s.budget,
        entreprise: s.entreprise,
        titre: s.titre,
        latitude: s.latitude,
        longitude: s.longitude,
        description: s.description,
        id_user: s.id_user
      }));
      setSignalements(mapped);
      alert(`✅ ${mapped.length} signalements récupérés depuis Firebase !`);
    } catch (err) {
      alert(err.message || "Erreur lors de la récupération depuis Firebase");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        if (!token) throw new Error("Utilisateur non authentifié");
        const sig = await getSignalementsApi(token);
        setSignalements(sig);
        const us = await getUsersApi(token);
        setUsers(us);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const changeStatus = async (id, newStatus) => {
    try {
      await updateSignalementStatusApi(id, newStatus, token);
      setSignalements(signalements.map(s =>
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      alert(err.message || "Erreur lors de la modification du statut");
    }
  };

  const unblockUser = async (id) => {
    try {
      await unblockUserApi(id, token);
      setUsers(users.map(u =>
        u.id === id ? { ...u, blocked: false } : u
      ));
      alert("✅ Utilisateur débloqué !");
    } catch (err) {
      alert(err.message || "Erreur lors du déblocage");
    }
  };

  const blockUser = async (id) => {
    try {
      await blockUserApi(id, token);
      setUsers(users.map(u =>
        u.id === id ? { ...u, blocked: true } : u
      ));
      alert("⛔ Utilisateur bloqué !");
    } catch (err) {
      alert(err.message || "Erreur lors du blocage");
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
  if (loading) return (
    <div className="manager-page">
      <div className="content-container" style={{textAlign: 'center', padding: '60px'}}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p style={{marginTop: '20px', color: 'white'}}>Chargement des données...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="manager-page">
      <div className="content-container" style={{textAlign: 'center', padding: '60px'}}>
        <div className="error-alert">
          <span style={{color:'#ff6b6b', fontSize: '3rem'}}>⚠️</span>
          <h3 style={{color:'#ff6b6b', margin: '20px 0'}}>Erreur de chargement</h3>
          <p style={{color:'#a0a0e0'}}>{error}</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="manager-page">
      <div className="page-header">
        <h1 className="page-title">
          👨‍💼 Espace Manager
        </h1>
        <p className="page-subtitle">
          Gestion des signalements et administration des utilisateurs
        </p>
      </div>

      <div className="content-container">
        <div style={{display: 'flex', gap: '16px', marginBottom: 24}}>
          {profile === "manager" && (
            <>
              <button 
                onClick={handleSyncToFirebase} 
                disabled={syncing}
                style={{
                  background: syncing ? '#9e9e9e' : '#4caf50', 
                  color: 'white', 
                  padding: '10px 18px', 
                  borderRadius: 6, 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {syncing ? '⏳ Synchronisation...' : '⬆️ Synchroniser vers Firebase (Mobile)'}
              </button>
              <button 
                onClick={handleGetFromFirebase} 
                disabled={syncing}
                style={{
                  background: syncing ? '#9e9e9e' : '#2196f3', 
                  color: 'white', 
                  padding: '10px 18px', 
                  borderRadius: 6, 
                  border: 'none', 
                  fontWeight: 600, 
                  cursor: syncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {syncing ? '⏳ Chargement...' : '⬇️ Récupérer depuis Firebase'}
              </button>
            </>
          )}
        </div>
        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#2c3e50'}}>
          📋 Gestion des signalements
        </h2>
        
        <div style={{overflowX: 'auto', marginBottom: '50px'}}>
          <table>
            <thead>
              <tr>
                <th>📅 Date</th>
                <th>🔄 Status</th>
                <th>📏 Surface (m²)</th>
                <th>💰 Budget</th>
                <th>🏢 Entreprise</th>
                <th>⚙️ Actions</th>
              </tr>
            </thead>
            <tbody>
              {signalements.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>📅</span>
                      {s.date}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      background: s.status === 'termine' ? 'rgba(76, 175, 80, 0.2)' : 
                                 s.status === 'en cours' ? 'rgba(255, 193, 7, 0.2)' : 
                                 'rgba(33, 150, 243, 0.2)',
                      color: s.status === 'termine' ? '#4caf50' : 
                             s.status === 'en cours' ? '#ffc107' : '#2196f3'
                    }}>
                      {s.status}
                    </span>
                  </td>
                  <td>{s.surface}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <span>💰</span>
                      {s.budget}
                    </div>
                  </td>
                  <td>{s.entreprise}</td>
                  <td>
                    <select 
                      value={s.status} 
                      onChange={e => changeStatus(s.id, e.target.value)}
                      style={{
                        minWidth: '140px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '2px solid #ddd',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="nouveau">🆕 Nouveau</option>
                      <option value="en cours">🔄 En cours</option>
                      <option value="termine">✅ Terminé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#2c3e50'}}>
          👥 Gestion des utilisateurs
        </h2>
        
        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>📧 Email</th>
                <th>🔄 Statut</th>
                <th>📅 Dernière connexion</th>
                <th>⚡ Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>{u.email.includes('manager') ? '👨‍💼' : '👤'}</span>
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      background: u.blocked ? 'rgba(255, 107, 107, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                      color: u.blocked ? '#ff6b6b' : '#4caf50'
                    }}>
                      {u.blocked ? "⛔ Bloqué" : "✅ Actif"}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <span>⏰</span>
                      {u.lastLogin}
                    </div>
                  </td>
                  <td>
                    {u.blocked ? (
                      <button onClick={() => unblockUser(u.id)} style={{background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50'}}>
                        <span>✅</span>
                        Débloquer
                      </button>
                    ) : (
                      <button onClick={() => blockUser(u.id)} style={{background: 'rgba(255, 107, 107, 0.2)', color: '#ff6b6b'}}>
                        <span>⛔</span>
                        Bloquer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{marginTop: '40px', background: 'rgba(255, 255, 255, 0.9)'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#2c3e50'}}>
            📊 Statistiques rapides
          </h3>
          <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
            <div>
              <div style={{fontSize: '2rem', color: '#4a54e1'}}>{signalements.length}</div>
              <div style={{color: '#7f8c8d', fontSize: '0.9rem'}}>Signalements</div>
            </div>
            <div>
              <div style={{fontSize: '2rem', color: '#00b894'}}>
                {users.filter(u => !u.blocked).length}
              </div>
              <div style={{color: '#7f8c8d', fontSize: '0.9rem'}}>Utilisateurs actifs</div>
            </div>
            <div>
              <div style={{fontSize: '2rem', color: '#ffc107'}}>
                {signalements.filter(s => s.status === 'en cours').length}
              </div>
              <div style={{color: '#7f8c8d', fontSize: '0.9rem'}}>En cours</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}