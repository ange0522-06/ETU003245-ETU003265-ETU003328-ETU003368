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

// Importer les signalements non importés depuis Firebase vers SQL
export async function importSignalementsFromFirebase(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  let res;
  try {
    res = await fetch(`${API_URL}/firebase/signalements/import`, {
      method: "POST",
      headers
    });
  } catch (e) {
    throw new Error("Impossible de joindre le backend pour l'import: " + e.message);
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Erreur ${res.status} lors de l'import depuis Firebase${txt ? ': ' + txt : ''}`);
  }
  return await res.json();
}
// src/api.js
// Services d'intégration API pour le frontend

// Utilise la variable d'environnement ou localhost par défaut
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

export async function checkManagerExistsApi() {
  const res = await fetch(`${API_URL}/auth/check-manager`);
  if (!res.ok) {
    throw new Error("Erreur lors de la vérification du manager");
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
    id_user: s.utilisateur ? s.utilisateur.id : s.id_user,
    // Ajouter les dates d'étapes
    dateNouveau: s.dateNouveau,
    dateEnCours: s.dateEnCours,
    dateTermine: s.dateTermine,
    avancement: s.avancement
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

// Récupérer les statistiques de traitement moyen
export async function getTraitementStatsApi(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/stats/traitement`, {
    headers
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des statistiques de traitement");
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

// Bloquer un utilisateur (Note: Si le backend n'a pas cet endpoint, il faudra l'ajouter)
export async function blockUserApi(userId, token) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/lock`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Erreur lors du blocage de l'utilisateur");
  }
  // Le backend retourne du texte, pas du JSON
  return await res.text();
}

// Débloquer un utilisateur
export async function unblockUserApi(userId, token) {
  const res = await fetch(`${API_URL}/admin/users/${userId}/unlock`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Erreur lors du déblocage de l'utilisateur");
  }
  // Le backend retourne du texte, pas du JSON
  return await res.text();
}

// Modifier le statut d'un signalement
export async function updateSignalementStatusApi(signalementId, newStatus, token) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ statut: newStatus })
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

// Debug - Vérifier les informations du token
export async function getTokenInfoApi(token) {
  const res = await fetch(`${API_URL}/debug/token-info`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération des infos du token");
  return await res.json();
}

// ========== API Photos ==========

// Récupérer toutes les photos d'un signalement
export async function getPhotosApi(signalementId) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}/photos`);
  if (!res.ok) throw new Error("Erreur lors de la récupération des photos");
  return await res.json();
}

// Uploader une photo pour un signalement
export async function uploadPhotoApi(signalementId, file, token) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/signalements/${signalementId}/photos`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erreur lors de l'upload de la photo");
  }
  return await res.json();
}

// Ajouter une photo par URL (pour Firebase)
export async function addPhotoByUrlApi(signalementId, url, token) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}/photos/url`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erreur lors de l'ajout de la photo");
  }
  return await res.json();
}

// Supprimer une photo
export async function deletePhotoApi(signalementId, photoId, token) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}/photos/${photoId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Erreur lors de la suppression de la photo");
  }
  return await res.json();
}

// Compter les photos d'un signalement
export async function countPhotosApi(signalementId) {
  const res = await fetch(`${API_URL}/signalements/${signalementId}/photos/count`);
  if (!res.ok) throw new Error("Erreur lors du comptage des photos");
  const data = await res.json();
  return data.count;
}
