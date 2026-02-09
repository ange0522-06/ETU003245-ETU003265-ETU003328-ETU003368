import { useState, useEffect } from "react";
import { getSignalementsApi, updateSignalementStatusApi, syncSignalementsToFirebase, getSignalementsFromFirebase, updateSignalementApi } from "./api";
import { useProfile } from "./ProfileContext";
import RecapTable from "./RecapTable";
import PhotoGallery from "./PhotoGallery";

export default function Manager() {
  const { profile } = useProfile();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [showPhotos, setShowPhotos] = useState(null); // null ou l'id du signalement
  const token = localStorage.getItem("token");

  // Fonction helper pour calculer l'avancement
  const calculerAvancement = (status) => {
    if (!status) return 0;
    switch (status.toLowerCase()) {
      case 'nouveau': return 0;
      case 'en cours': return 50;
      case 'termine': case 'terminé': return 100;
      default: return 0;
    }
  };

  // Fonction helper pour formater les dates
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Synchronisation Firebase - Exporter vers Firebase
  const handleSyncToFirebase = async () => {
    setSyncing(true);
    try {
      const result = await syncSignalementsToFirebase(token);
      setError("");
      // small success feedback
      alert(`✅ ${result.exportedCount || 'Tous les'} signalements exportés vers Firebase !`);
    } catch (err) {
      setError(err.message || "Erreur lors de la synchronisation vers Firebase");
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
      setError("");
      // keep a small non-blocking confirmation
      // using alert for quick feedback but not for errors
      alert(`✅ ${mapped.length} signalements récupérés depuis Firebase !`);
    } catch (err) {
      setError(err.message || "Erreur lors de la récupération depuis Firebase");
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

  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ surface: '', budget: '', entreprise: '', status: '' });

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditFields({ surface: s.surface || '', budget: s.budget || '', entreprise: s.entreprise || '', status: s.status || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({ surface: '', budget: '', entreprise: '', status: '' });
  };

  const saveEdit = async (id) => {
    try {
      const payload = {
        surfaceM2: editFields.surface,
        budget: editFields.budget,
        entreprise: editFields.entreprise,
        statut: editFields.status
      };
      const updated = await updateSignalementApi(id, payload, token);
      setSignalements(signalements.map(s =>
        s.id === id ? {
          ...s,
          surface: updated.surfaceM2 ?? updated.surface ?? editFields.surface,
          budget: updated.budget ?? editFields.budget,
          entreprise: updated.entreprise ?? editFields.entreprise,
          status: updated.statut ?? updated.status ?? editFields.status
        } : s
      ));
      setEditingId(null);
      alert('✅ Signalement mis à jour et synchronisé');
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du signalement');
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
  
  // Ne bloque plus l'affichage de la page : afficher une alerte non bloquante
  
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
        {error && (
          <div className="error-alert" style={{marginBottom: 20}}>
            <span style={{color:'#ff6b6b', fontSize: '2rem'}}>⚠️</span>
            <h3 style={{color:'#ff6b6b', margin: '10px 0'}}>Erreur lors de la récupération des utilisateurs</h3>
            <p style={{color:'#a0a0e0'}}>{error}</p>
            <div style={{marginTop: 8}}>
              <button onClick={() => window.location.reload()} style={{padding: '6px 12px'}}>Réessayer</button>
            </div>
          </div>
        )}
        <div style={{display: 'flex', gap: '16px', marginBottom: 24, flexWrap: 'wrap'}}>
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
                <th>� Avancement</th>
                <th>📏 Surface (m²)</th>
                <th>💰 Budget</th>
                <th>🏢 Entreprise</th>
                <th>🕒 Dates étapes</th>
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
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{
                        width: '100px',
                        height: '20px',
                        background: '#e0e0e0',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${calculerAvancement(s.status)}%`,
                          height: '100%',
                          background: s.status === 'termine' ? '#4caf50' : 
                                     s.status === 'en cours' ? '#ffc107' : '#2196f3',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{fontWeight: '600', fontSize: '0.9rem'}}>
                        {calculerAvancement(s.status)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {editingId === s.id ? (
                      <input
                        value={editFields.surface}
                        onChange={e => setEditFields({ ...editFields, surface: e.target.value })}
                        style={{padding: '6px', borderRadius: 6, width: 100}}
                      />
                    ) : (
                      s.surface
                    )}
                  </td>
                  <td>
                    {editingId === s.id ? (
                      <input
                        value={editFields.budget}
                        onChange={e => setEditFields({ ...editFields, budget: e.target.value })}
                        style={{padding: '6px', borderRadius: 6, width: 120}}
                      />
                    ) : (
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <span>💰</span>
                        {s.budget}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === s.id ? (
                      <input
                        value={editFields.entreprise}
                        onChange={e => setEditFields({ ...editFields, entreprise: e.target.value })}
                        style={{padding: '6px', borderRadius: 6, width: 160}}
                      />
                    ) : (
                      s.entreprise
                    )}
                  </td>
                  <td>
                    <div style={{fontSize: '0.85rem', color: '#555'}}>
                      {s.dateNouveau && (
                        <div style={{marginBottom: 4}}>
                          <span style={{fontWeight: '600', color: '#2196f3'}}>🆕 Nouveau:</span> {formatDate(s.dateNouveau)}
                        </div>
                      )}
                      {s.dateEnCours && (
                        <div style={{marginBottom: 4}}>
                          <span style={{fontWeight: '600', color: '#ffc107'}}>🔄 En cours:</span> {formatDate(s.dateEnCours)}
                        </div>
                      )}
                      {s.dateTermine && (
                        <div>
                          <span style={{fontWeight: '600', color: '#4caf50'}}>✅ Terminé:</span> {formatDate(s.dateTermine)}
                        </div>
                      )}
                      {!s.dateNouveau && !s.dateEnCours && !s.dateTermine && (
                        <span style={{color: '#999'}}>Aucune date</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {editingId === s.id ? (
                      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                        <select
                          value={editFields.status}
                          onChange={e => setEditFields({ ...editFields, status: e.target.value })}
                          style={{padding: '6px', borderRadius: 6}}
                        >
                          <option value="nouveau">🆕 Nouveau</option>
                          <option value="en cours">🔄 En cours</option>
                          <option value="termine">✅ Terminé</option>
                        </select>
                        <button onClick={() => saveEdit(s.id)} style={{padding: '6px 10px', background: '#4caf50', color: 'white', borderRadius: 6}}>Sauvegarder</button>
                        <button onClick={cancelEdit} style={{padding: '6px 10px', background: '#e0e0e0', borderRadius: 6}}>Annuler</button>
                      </div>
                    ) : (
                      <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                        <select 
                          value={s.status} 
                          onChange={e => changeStatus(s.id, e.target.value)}
                          style={{
                            minWidth: '140px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="nouveau">🆕 Nouveau</option>
                          <option value="en cours">🔄 En cours</option>
                          <option value="termine">✅ Terminé</option>
                        </select>
                        <button onClick={() => startEdit(s)} style={{padding: '6px 10px'}}>✏️ Edit</button>
                        <button 
                          onClick={() => setShowPhotos(s.id)} 
                          style={{
                            padding: '6px 10px',
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          📷 Photos
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tableau de récapitulation */}
        {signalements.length > 0 && (
          <RecapTable points={signalements} />
        )}
      </div>

      {/* Modal Galerie de Photos */}
      {showPhotos && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowPhotos(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPhotos(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✕ Fermer
            </button>
            <h2 style={{marginTop: 0, marginBottom: 20}}>Photos du signalement #{showPhotos}</h2>
            <PhotoGallery signalementId={showPhotos} canEdit={true} />
          </div>
        </div>
      )}
    </div>
  );
}