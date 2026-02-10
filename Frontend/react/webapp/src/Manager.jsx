import { useState, useEffect } from "react";
import { getSignalementsApi, updateSignalementStatusApi, syncSignalementsToFirebase, getSignalementsFromFirebase, importSignalementsFromFirebase, updateSignalementApi } from "./api";
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
  const [prixParM2, setPrixParM2] = useState(() => {
    const saved = localStorage.getItem('prixParM2');
    return saved ? parseInt(saved, 10) : 5000; // Valeur par défaut: 5000 Ar/m²
  });
  const token = localStorage.getItem("token");

  // Sauvegarder le prix par m² dans localStorage
  const handlePrixParM2Change = (value) => {
    const prix = parseInt(value, 10) || 0;
    setPrixParM2(prix);
    localStorage.setItem('prixParM2', prix.toString());
  };

  // Calculer le budget automatiquement: prix_par_m2 * niveau * surface_m2
  const calculerBudget = (niveau, surface) => {
    const niv = parseInt(niveau, 10) || 1;
    const surf = parseFloat(surface) || 0;
    return prixParM2 * niv * surf;
  };

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

  // Importer les signalements non importés depuis Firebase vers SQL
  const handleImportFromFirebase = async () => {
    setSyncing(true);
    try {
      const result = await importSignalementsFromFirebase(token);
      setError("");
      
      // Afficher le résultat de l'import
      const message = `✅ Import terminé !\n` +
        `- ${result.importedCount} signalement(s) importé(s) avec succès\n` +
        `- ${result.errorCount} erreur(s)\n` +
        `- ${result.totalUnimported} signalement(s) non importé(s) au total`;
      alert(message);
      
      // Recharger les signalements depuis SQL pour voir les nouveaux
      const sig = await getSignalementsApi(token);
      setSignalements(sig);
    } catch (err) {
      setError(err.message || "Erreur lors de l'import depuis Firebase");
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
  const [editFields, setEditFields] = useState({ surface: '', budget: '', entreprise: '', status: '', niveau: 1 });

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditFields({ 
      surface: s.surface || '', 
      budget: s.budget || '', 
      entreprise: s.entreprise || '', 
      status: s.status || '',
      niveau: s.niveau || 1
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFields({ surface: '', budget: '', entreprise: '', status: '', niveau: 1 });
  };

  const saveEdit = async (id) => {
    try {
      // Calcul automatique du budget
      const budgetCalcule = calculerBudget(editFields.niveau, editFields.surface);
      const payload = {
        surfaceM2: editFields.surface,
        budget: budgetCalcule,
        entreprise: editFields.entreprise,
        statut: editFields.status,
        niveau: editFields.niveau
      };
      const updated = await updateSignalementApi(id, payload, token);
      setSignalements(signalements.map(s =>
        s.id === id ? {
          ...s,
          surface: updated.surfaceM2 ?? updated.surface ?? editFields.surface,
          budget: updated.budget ?? budgetCalcule,
          entreprise: updated.entreprise ?? editFields.entreprise,
          status: updated.statut ?? updated.status ?? editFields.status,
          niveau: updated.niveau ?? editFields.niveau
        } : s
      ));
      setEditingId(null);
      alert(`✅ Signalement mis à jour !\nBudget calculé: ${budgetCalcule.toLocaleString()} Ar (${prixParM2} x ${editFields.niveau} x ${editFields.surface})`);
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
          Espace Manager
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
                onClick={handleImportFromFirebase} 
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
                {syncing ? '⏳ Import en cours...' : '⬇️ Importer depuis Firebase'}
              </button>
            </>
          )}
        </div>

        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#2c3e50'}}>
          📋 Gestion des signalements
        </h2>
        
        {/* Configuration du prix par m² */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{color: 'white'}}>
            <label style={{fontWeight: '600', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
              💰 Prix par m² forfaitaire :
            </label>
            <p style={{margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9}}>
              Utilisé pour le calcul automatique du budget
            </p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <input
              type="number"
              value={prixParM2}
              onChange={(e) => handlePrixParM2Change(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                width: '150px',
                textAlign: 'right'
              }}
            />
            <span style={{color: 'white', fontWeight: '600', fontSize: '1.1rem'}}>Ar/m²</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem'
          }}>
            <strong>Formule :</strong> Budget = Prix/m² × Niveau × Surface
          </div>
        </div>
        
        <div style={{overflowX: 'auto', marginBottom: '50px'}}>
          <table>
            <thead>
              <tr>
                <th>📅 Date</th>
                <th>🔄 Status</th>
                <th>📊 Niveau</th>
                <th>📈 Avancement</th>
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
                    {editingId === s.id ? (
                      <select
                        value={editFields.niveau}
                        onChange={e => setEditFields({ ...editFields, niveau: parseInt(e.target.value, 10) })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '2px solid #9c27b0',
                          background: 'white',
                          fontWeight: '600',
                          color: '#9c27b0'
                        }}
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        background: 'rgba(156, 39, 176, 0.15)',
                        color: '#9c27b0'
                      }}>
                        {s.niveau || 1}/10
                      </span>
                    )}
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