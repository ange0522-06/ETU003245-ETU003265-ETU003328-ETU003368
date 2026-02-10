import { useEffect, useState } from "react";
import { getSignalementsApi, getStatsApi } from "./api";
import RecapTable from "./RecapTable";

export default function Dashboard() {
  const [signalements, setSignalements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [points, setPoints] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Si pas de backend, utiliser les données mock pour points
    const mockPoints = [
      { 
        id: 1, 
        latitude: -18.8792, 
        longitude: 47.5079,
        titre: "Route endommagée",
        status: "en cours",
        date: "2026-01-15",
        surface: 20,
        budget: 1000,
        entreprise: "ABC Construction"
      },
      { 
        id: 2, 
        latitude: -18.9100, 
        longitude: 47.5250,
        titre: "Travaux de revêtement",
        status: "nouveau",
        date: "2026-01-20",
        surface: 50,
        budget: 3000,
        entreprise: "XYZ Travaux"
      },
      { 
        id: 3, 
        latitude: -18.8650, 
        longitude: 47.5350,
        titre: "Réparation de pont",
        status: "termine",
        date: "2026-01-10",
        surface: 100,
        budget: 5000,
        entreprise: "InfraPlus"
      },
    ];

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        if (!token) throw new Error("Utilisateur non authentifié");
        const [sig, st] = await Promise.all([
          getSignalementsApi(token),
          getStatsApi(token)
        ]);
        setSignalements(sig);
        setStats(st);
        setPoints(sig.length ? sig : mockPoints); // Utilise signalements si dispo, sinon mock
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
        setPoints(mockPoints);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) return (
    <div className="dashboard-page">
      <div className="content-container" style={{textAlign: 'center', padding: '60px'}}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p style={{marginTop: '20px', color: 'white'}}>Chargement des données...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="dashboard-page">
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
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">
          Tableau de bord des travaux
        </h1>
        <p className="page-subtitle">
          Suivi en temps réel des signalements et avancement des travaux routiers
        </p>
      </div>

      <div className="content-container">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📍</div>
              <div className="stat-value">{stats.nbPoints}</div>
              <div className="stat-label">Points de travaux</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📐</div>
              <div className="stat-value">{stats.totalSurface} m²</div>
              <div className="stat-label">Surface totale</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">{stats.avancement}%</div>
              <div className="stat-label">Avancement global</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">{stats.totalBudget} Ar</div>
              <div className="stat-label">Budget total</div>
            </div>
          </div>
        )}

        <div style={{marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px'}}>
          {/* Schéma de répartition par statut */}
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937'}}>
              📊 Répartition par statut
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {/* Terminés */}
              <div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px'}}>
                  <span style={{fontSize: '13px', color: '#4b5563'}}>Terminés</span>
                  <span style={{fontSize: '14px', fontWeight: '600', color: '#10b981'}}>
                    {signalements.filter(s => s.status === 'termine').length}
                  </span>
                </div>
                <div style={{width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{
                    width: `${(signalements.filter(s => s.status === 'termine').length / signalements.length * 100) || 0}%`,
                    height: '100%',
                    background: '#10b981',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              
              {/* En cours */}
              <div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px'}}>
                  <span style={{fontSize: '13px', color: '#4b5563'}}>En cours</span>
                  <span style={{fontSize: '14px', fontWeight: '600', color: '#f59e0b'}}>
                    {signalements.filter(s => s.status === 'en cours').length}
                  </span>
                </div>
                <div style={{width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{
                    width: `${(signalements.filter(s => s.status === 'en cours').length / signalements.length * 100) || 0}%`,
                    height: '100%',
                    background: '#f59e0b',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
              
              {/* En attente */}
              <div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px'}}>
                  <span style={{fontSize: '13px', color: '#4b5563'}}>En attente</span>
                  <span style={{fontSize: '14px', fontWeight: '600', color: '#3b82f6'}}>
                    {signalements.filter(s => s.status === 'nouveau').length}
                  </span>
                </div>
                <div style={{width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden'}}>
                  <div style={{
                    width: `${(signalements.filter(s => s.status === 'nouveau').length / signalements.length * 100) || 0}%`,
                    height: '100%',
                    background: '#3b82f6',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Schéma circulaire de progression */}
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937'}}>
              📈 Avancement global
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
              <div style={{position: 'relative', width: '120px', height: '120px'}}>
                <svg width="120" height="120" style={{transform: 'rotate(-90deg)'}}>
                  <circle cx="60" cy="60" r="50" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    stroke="#3b82f6" 
                    strokeWidth="10" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats.avancement / 100))}`}
                    style={{transition: 'stroke-dashoffset 0.5s ease'}}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '24px', fontWeight: '700', color: '#1f2937'}}>{stats.avancement}%</div>
                </div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '14px', color: '#4b5563', marginBottom: '8px'}}>Progression des travaux</div>
                <div style={{fontSize: '12px', color: '#9ca3af'}}>
                  {signalements.filter(s => s.status === 'termine').length} sur {signalements.length} terminés
                </div>
              </div>
            </div>
          </div>

          {/* Schéma des entreprises avec barres */}
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937'}}>
              🏢 Activité des entreprises
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '36px', fontWeight: '700', color: '#1f2937'}}>
                  {[...new Set(signalements.map(s => s.entreprise))].length}
                </div>
                <div style={{fontSize: '13px', color: '#6b7280'}}>Entreprises</div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span style={{fontSize: '13px', color: '#4b5563'}}>Signalements/Entreprise</span>
                  <span style={{fontSize: '14px', fontWeight: '600', color: '#1f2937'}}>
                    {Math.round(signalements.length / [...new Set(signalements.map(s => s.entreprise))].length) || 0}
                  </span>
                </div>
                <div style={{width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '5px', overflow: 'hidden'}}>
                  <div style={{
                    width: '75%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                    borderRadius: '5px'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Schéma avec graphique de zones */}
          <div style={{background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937'}}>
              🗺️ Couverture géographique
            </h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: '10px'}}>
                <div style={{fontSize: '36px', fontWeight: '700', color: '#1f2937'}}>{points.length}</div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>zones</div>
              </div>
              <div style={{display: 'flex', gap: '4px', height: '60px', alignItems: 'flex-end'}}>
                {[3, 5, 4, 7, 2, 6, 4].map((height, idx) => (
                  <div key={idx} style={{
                    flex: 1,
                    height: `${height * 10}px`,
                    background: idx % 2 === 0 ? '#3b82f6' : '#60a5fa',
                    borderRadius: '4px 4px 0 0'
                  }}></div>
                ))}
              </div>
              <div style={{fontSize: '12px', color: '#9ca3af', textAlign: 'center'}}>
                Répartition des points sur la carte
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}