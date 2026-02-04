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
          📊 Tableau de bord des travaux
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

        <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', color: '#2c3e50'}}>
          📋 Liste des signalements
        </h2>

        <div style={{overflowX: 'auto'}}>
          <table>
            <thead>
              <tr>
                <th>📅 Date</th>
                <th>🔄 Status</th>
                <th>📏 Surface (m²)</th>
                <th>💰 Budget</th>
                <th>🏢 Entreprise</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}