import React, { useEffect, useState } from "react";
import { unblockUserApi } from "./api";

export default function UnblockUsers() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");



  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/users/locked", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs bloqués.");
      const users = await res.json();
      setBlockedUsers(users);
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs bloqués.");
    }
    setLoading(false);
  };

  const handleUnblock = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await unblockUserApi(userId, token);
      setSuccess("Utilisateur débloqué !");
      setTimeout(() => setSuccess(""), 3000);
      fetchBlockedUsers();
    } catch (err) {
      console.error("Erreur déblocage:", err);
      setError(err.message || "Erreur lors du déblocage.");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="manager-page">
      <div className="page-header">
        <h1 className="page-title">
          Débloquer les utilisateurs
        </h1>
        <p className="page-subtitle">
          Gérez les utilisateurs qui ont été bloqués suite à plusieurs tentatives de connexion échouées
        </p>
      </div>

      <div className="content-container">
        <div className="card">
          {loading && <p>Chargement...</p>}
          {error && <div className="error-alert" style={{marginBottom: 20}}>
            <span style={{color:'#ff6b6b', fontSize: '2rem'}}>⚠️</span>
            <p style={{color:'#ff6b6b', margin: '10px 0'}}>{error}</p>
          </div>}
          {success && <div className="success-alert" style={{marginBottom: 20, padding: 20, background: 'rgba(76, 175, 80, 0.2)', borderRadius: 8}}>
            <span style={{color:'#4caf50', fontSize: '2rem'}}>✅</span>
            <p style={{color:'#4caf50', margin: '10px 0'}}>{success}</p>
          </div>}
          
          {!loading && !error && blockedUsers.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <span style={{fontSize: '3rem'}}>✅</span>
              <h3 style={{color: '#2c3e50', marginTop: 20}}>Aucun utilisateur bloqué</h3>
              <p style={{color: '#7f8c8d'}}>Tous les utilisateurs ont un accès normal au système</p>
            </div>
          )}
          
          {!loading && blockedUsers.length > 0 && (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>📧 Email</th>
                    <th>🔢 Tentatives échouées</th>
                    <th>⚡ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <span>👤</span>
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          background: 'rgba(255, 107, 107, 0.2)',
                          color: '#ff6b6b'
                        }}>
                          {user.failedAttempts || 3} tentatives
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleUnblock(user.id)}
                          style={{
                            background: 'rgba(76, 175, 80, 0.2)',
                            color: '#4caf50',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                        >
                          <span>✅</span> Débloquer
                        </button>
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
