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
      fetchBlockedUsers();
    } catch (err) {
      setError("Erreur lors du déblocage.");
    }
  };

  return (
    <div className="card">
      <h2>Débloquer les utilisateurs</h2>
      {loading && <p>Chargement...</p>}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <ul>
        {blockedUsers.length === 0 && !loading && <li>Aucun utilisateur bloqué.</li>}
        {blockedUsers.map((user) => (
          <li key={user.id} className="user-row">
            <span>{user.username ? user.username : user.email} ({user.email})</span>
            <button onClick={() => handleUnblock(user.id)}>Débloquer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
