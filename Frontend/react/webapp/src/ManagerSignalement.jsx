import React, { useEffect, useState } from "react";
import { getSignalementsApi, updateSignalementStatusApi } from "./api";

export default function ManagerSignalement() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSignalements();
  }, []);

  const fetchSignalements = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSignalementsApi(token);
      setSignalements(data);
    } catch (err) {
      setError("Erreur lors du chargement des signalements.");
    }
    setLoading(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateSignalementStatusApi(id, newStatus, token);
      setSignalements(signalements.map(s =>
        s.id === id ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      alert("Erreur lors de la modification du statut");
    }
  };

  return (
    <div className="card">
      <h2>Gestion des signalements</h2>
      {loading && <p>Chargement...</p>}
      {error && <p className="error">{error}</p>}
      <table style={{width: '100%', marginTop: 16}}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Statut</th>
            <th>Surface (m²)</th>
            <th>Budget</th>
            <th>Entreprise</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {signalements.length === 0 && !loading && (
            <tr><td colSpan={6}>Aucun signalement trouvé.</td></tr>
          )}
          {signalements.map((s) => (
            <tr key={s.id}>
              <td>{s.date}</td>
              <td>
                <select value={s.status} onChange={e => handleStatusChange(s.id, e.target.value)}>
                  <option value="nouveau">Nouveau</option>
                  <option value="en cours">En cours</option>
                  <option value="termine">Terminé</option>
                </select>
              </td>
              <td>{s.surface}</td>
              <td>{s.budget}</td>
              <td>{s.entreprise}</td>
              <td>
                {/* D'autres actions à ajouter ici si besoin */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
