import { useState, useEffect } from "react";
import { getTraitementStatsApi, getStatsApi, getSignalementsApi } from "./api";
import { useProfile } from "./ProfileContext";

export default function Stats() {
  const { profile } = useProfile();
  const [traitementStats, setTraitementStats] = useState(null);
  const [generalStats, setGeneralStats] = useState(null);
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        if (!token) throw new Error("Utilisateur non authentifié");
        
        const [stats, traitement, sig] = await Promise.all([
          getStatsApi(token),
          getTraitementStatsApi(token),
          getSignalementsApi(token)
        ]);
        
        setGeneralStats(stats);
        setTraitementStats(traitement);
        setSignalements(sig);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (profile !== "manager") {
    return (
      <div className="manager-page">
        <div className="content-container" style={{textAlign: 'center', padding: '60px'}}>
          <div className="error-alert">
            <span style={{color:'#ff6b6b', fontSize: '3rem'}}>⛔</span>
            <h3 style={{color:'#ff6b6b', margin: '20px 0'}}>Accès réservé au manager</h3>
            <p style={{color:'#a0a0e0'}}>Vous devez être connecté en tant que manager pour accéder aux statistiques.</p>
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
          <p style={{marginTop: '20px', color: 'white'}}>Chargement des statistiques...</p>
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
          📊 Statistiques des travaux routiers
        </h1>
        <p className="page-subtitle">
          Vue d'ensemble et analyse des performances de traitement
        </p>
      </div>

      <div className="content-container">
        {/* Statistiques générales */}
        {generalStats && (
          <div className="card" style={{marginBottom: '40px', background: 'rgba(255, 255, 255, 0.95)'}}>
            <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#2c3e50'}}>
              📈 Vue d'ensemble
            </h3>
            <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'space-around'}}>
              <div style={{textAlign: 'center', padding: '20px', background: 'rgba(74, 84, 225, 0.1)', borderRadius: 12, minWidth: 150}}>
                <div style={{fontSize: '2.5rem', color: '#4a54e1', fontWeight: '700'}}>{generalStats.nbPoints}</div>
                <div style={{color: '#7f8c8d', fontSize: '0.95rem', marginTop: 8}}>Total signalements</div>
              </div>
              <div style={{textAlign: 'center', padding: '20px', background: 'rgba(0, 184, 148, 0.1)', borderRadius: 12, minWidth: 150}}>
                <div style={{fontSize: '2.5rem', color: '#00b894', fontWeight: '700'}}>{Math.round(generalStats.totalSurface)} m²</div>
                <div style={{color: '#7f8c8d', fontSize: '0.95rem', marginTop: 8}}>Surface totale</div>
              </div>
              <div style={{textAlign: 'center', padding: '20px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: 12, minWidth: 150}}>
                <div style={{fontSize: '2.5rem', color: '#ffc107', fontWeight: '700'}}>{generalStats.avancement}%</div>
                <div style={{color: '#7f8c8d', fontSize: '0.95rem', marginTop: 8}}>Avancement global</div>
              </div>
              <div style={{textAlign: 'center', padding: '20px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: 12, minWidth: 150}}>
                <div style={{fontSize: '2.5rem', color: '#4caf50', fontWeight: '700'}}>{Math.round(generalStats.totalBudget).toLocaleString('fr-FR')} Ar</div>
                <div style={{color: '#7f8c8d', fontSize: '0.95rem', marginTop: 8}}>Budget total</div>
              </div>
            </div>
          </div>
        )}

        {/* Tableau de statistiques de traitement moyen */}
        {traitementStats && (
          <div className="card" style={{marginBottom: '40px', background: 'rgba(255, 255, 255, 0.95)', padding: '30px'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#2c3e50'}}>
              ⏱️ Statistiques de traitement moyen des travaux
            </h2>
            
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>📈 Étape</th>
                    <th>⏱️ Temps moyen (jours)</th>
                    <th>📝 Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>🆕</span>
                        <span style={{fontWeight: '600'}}>Nouveau → En cours</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'rgba(33, 150, 243, 0.2)',
                        color: '#2196f3',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        {traitementStats.moyenneNouveauEnCoursJours} jours
                      </span>
                    </td>
                    <td>Temps moyen entre la création et le début des travaux</td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>🔄</span>
                        <span style={{fontWeight: '600'}}>En cours → Terminé</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'rgba(255, 193, 7, 0.2)',
                        color: '#ffc107',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        {traitementStats.moyenneEnCoursTermineJours} jours
                      </span>
                    </td>
                    <td>Temps moyen de réalisation des travaux</td>
                  </tr>
                  <tr style={{background: 'rgba(76, 175, 80, 0.1)'}}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span>✅</span>
                        <span style={{fontWeight: '700'}}>Nouveau → Terminé (Total)</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'rgba(76, 175, 80, 0.3)',
                        color: '#4caf50',
                        fontWeight: '700',
                        fontSize: '1.2rem'
                      }}>
                        {traitementStats.moyenneTotaleJours} jours
                      </span>
                    </td>
                    <td>Temps moyen total du signalement à la fin des travaux</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{marginTop: 20, padding: '15px', background: 'rgba(33, 150, 243, 0.1)', borderRadius: 8, borderLeft: '4px solid #2196f3'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{fontSize: '1.5rem'}}>ℹ️</span>
                <div>
                  <strong>Note:</strong> Ces statistiques sont basées sur {traitementStats.nombreSignalementsAnalyses} signalement(s) terminé(s).
                  <br/>
                  <span style={{fontSize: '0.9rem', color: '#555'}}>
                    Les calculs utilisent uniquement les signalements qui ont atteint le statut "terminé" avec toutes les dates enregistrées.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Répartition par statut */}
        <div className="card" style={{marginBottom: '40px', background: 'rgba(255, 255, 255, 0.95)'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#2c3e50'}}>
            📊 Répartition par statut
          </h3>
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Nombre</th>
                  <th>Pourcentage</th>
                  <th>Avancement</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>🆕</span>
                      <span style={{fontWeight: '600'}}>Nouveau</span>
                    </div>
                  </td>
                  <td>{signalements.filter(s => s.status === 'nouveau').length}</td>
                  <td>{signalements.length > 0 ? Math.round((signalements.filter(s => s.status === 'nouveau').length / signalements.length) * 100) : 0}%</td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(33, 150, 243, 0.2)',
                      color: '#2196f3',
                      fontWeight: '600'
                    }}>
                      0%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>🔄</span>
                      <span style={{fontWeight: '600'}}>En cours</span>
                    </div>
                  </td>
                  <td>{signalements.filter(s => s.status === 'en cours').length}</td>
                  <td>{signalements.length > 0 ? Math.round((signalements.filter(s => s.status === 'en cours').length / signalements.length) * 100) : 0}%</td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(255, 193, 7, 0.2)',
                      color: '#ffc107',
                      fontWeight: '600'
                    }}>
                      50%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>✅</span>
                      <span style={{fontWeight: '600'}}>Terminé</span>
                    </div>
                  </td>
                  <td>{signalements.filter(s => s.status === 'termine').length}</td>
                  <td>{signalements.length > 0 ? Math.round((signalements.filter(s => s.status === 'termine').length / signalements.length) * 100) : 0}%</td>
                  <td>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: 'rgba(76, 175, 80, 0.2)',
                      color: '#4caf50',
                      fontWeight: '600'
                    }}>
                      100%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
