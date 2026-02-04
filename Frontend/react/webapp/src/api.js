// Synchronisation Firebase (Manager)
export async function syncSignalementsToFirebase(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  let res;
  try {
    res = await fetch(`${API_URL}/firebase/signalements/sync`, {
      method: "POST",
      headers
    });
  } catch (e) {
    throw new Error("Impossible de joindre le backend pour la synchronisation: " + e.message);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erreur ${res.status} lors de la synchronisation vers Firebase${txt ? ': ' + txt : ''}`);
  }
  return await res.json();
}

export async function getSignalementsFromFirebase(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  let res;
  try {
    res = await fetch(`${API_URL}/firebase/signalements`, { headers });
  } catch (e) {
    throw new Error("Impossible de joindre le backend pour récupérer depuis Firebase: " + e.message);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erreur ${res.status} lors de la récupération depuis Firebase${txt ? ': ' + txt : ''}`);
  }
  return await res.json();
}
// src/api.js
// Services d'intégration API pour le frontend

const API_URL = "http://localhost:8080/api"; // À adapter selon le backend

export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Email ou mot de passe incorrect");
  }
  return await res.json();
}

export async function registerApi(email, password, role = "user") {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg);
  }
  return await res.json();
}

export async function getSignalementsApi(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/signalements`, { headers });
  if (!res.ok) throw new Error("Erreur lors de la récupération des signalements");
  const data = await res.json();
  // mapping des champs backend -> frontend
  return data.map(s => ({
    id: s.idSignalement,
    status: s.statut,
    date: s.dateSignalement ? s.dateSignalement.split('T')[0] : '',
    surface: s.surfaceM2,
    budget: s.budget,
    entreprise: s.entreprise,
    titre: s.titre,
    latitude: s.latitude,
    longitude: s.longitude,
    description: s.description,
    id_user: s.utilisateur ? s.utilisateur.id : s.id_user
  }));
}

export async function getStatsApi(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/stats`, {
    headers
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

// Mettre à jour un signalement (surface, budget, entreprise, statut, ...)
export async function updateSignalementApi(signalementId, updates, token) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour du signalement");
  return await res.json();
}
