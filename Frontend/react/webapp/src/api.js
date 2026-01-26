// src/api.js
// Services d'intégration API pour le frontend

const API_URL = "http://localhost:8080/api"; // À adapter selon le backend

export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Erreur de connexion");
  return await res.json();
}

export async function registerApi(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Erreur d'inscription");
  return await res.json();
}

export async function getSignalementsApi(token) {
  const res = await fetch(`${API_URL}/signalements`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des signalements");
  return await res.json();
}

export async function getStatsApi(token) {
  const res = await fetch(`${API_URL}/stats`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des stats");
  return await res.json();
}

// Ajouter d'autres services selon les endpoints du backend

// Récupérer la liste des utilisateurs (Manager)
export async function getUsersApi(token) {
  const res = await fetch(`${API_URL}/users`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
  return await res.json();
}

// Bloquer un utilisateur
export async function blockUserApi(userId, token) {
  const res = await fetch(`${API_URL}/users/${userId}/block`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors du blocage de l'utilisateur");
  return await res.json();
}

// Débloquer un utilisateur
export async function unblockUserApi(userId, token) {
  const res = await fetch(`${API_URL}/users/${userId}/unblock`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors du déblocage de l'utilisateur");
  return await res.json();
}

// Modifier le statut d'un signalement
export async function updateSignalementStatusApi(signalementId, newStatus, token) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}/status`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error("Erreur lors de la modification du statut");
  return await res.json();
}
