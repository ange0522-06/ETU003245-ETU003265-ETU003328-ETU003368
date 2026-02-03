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
    const errorText = await res.text();
    let errorMessage = "Email ou mot de passe incorrect";
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
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
    const errorText = await res.text();
    let errorMessage = "Erreur lors de l'inscription";
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  return await res.json();
}

export async function getSignalementsApi(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/signalements`, { headers });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la récupération des signalements: ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  console.log("Signalements reçus du backend:", data);
  
  // mapping des champs backend -> frontend
  return Array.isArray(data) ? data.map(s => ({
    id: s.idSignalement || s.id,
    status: s.statut || s.status,
    date: s.dateSignalement ? s.dateSignalement.split('T')[0] : (s.date || ''),
    surface: s.surfaceM2 || s.surface,
    budget: s.budget,
    entreprise: s.entreprise,
    titre: s.titre || s.title,
    latitude: s.latitude,
    longitude: s.longitude,
    description: s.description,
    id_user: s.utilisateur ? s.utilisateur.id : s.id_user
  })) : [];
}

export async function getStatsApi(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/stats`, {
    headers
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la récupération des stats: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Récupérer la liste des utilisateurs (Manager)
export async function getUsersApi(token) {
  console.log("getUsersApi appelé avec token:", token ? "Présent" : "Absent");
  
  if (!token) {
    throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
  }
  
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  console.log("Envoi requête à:", `${API_URL}/users`);
  
  try {
    const res = await fetch(`${API_URL}/users`, { headers });
    
    console.log("Réponse getUsersApi - Status:", res.status, "OK:", res.ok);
    
    if (res.status === 403) {
      // Erreur d'autorisation spécifique
      const errorText = await res.text();
      console.error("Accès refusé (403). Détails:", errorText);
      
      let errorMessage = "Accès refusé. ";
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage += errorData.message || "Vous n'avez pas les permissions nécessaires.";
        
        // Vérifier si c'est un problème de rôle
        if (errorData.error && errorData.error.includes("role")) {
          errorMessage += " Seuls les managers peuvent accéder à cette fonctionnalité.";
        }
      } catch {
        errorMessage += "Vérifiez que vous êtes connecté en tant que manager.";
      }
      
      throw new Error(errorMessage);
    }
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Autre erreur getUsersApi:", {
        status: res.status,
        statusText: res.statusText,
        errorText: errorText
      });
      
      throw new Error(`Erreur serveur (${res.status}): ${errorText || res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Utilisateurs reçus du backend:", data);
    
    // Normalisation des données
    if (Array.isArray(data)) {
      return data.map(user => ({
        id: user.id || user.userId,
        email: user.email || user.username,
        username: user.username || user.email,
        role: user.role || 'user',
        field_attempts: user.field_attempts || user.failed_attempts || user.failedAttempts || 0,
        locked: user.locked || (user.field_attempts > 2) || false,
        blocked: user.blocked || user.locked || (user.field_attempts > 2) || false,
        lastLogin: user.lastLogin || user.last_login || user.lastConnexion || '-',
        createdAt: user.createdAt || user.created_at
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error("Erreur dans getUsersApi:", error);
    throw error;
  }
}

// Vérifier si un manager existe déjà
export async function checkManagerExists() {
  try {
    const res = await fetch(`${API_URL}/auth/has-manager`);
    
    if (!res.ok) {
      console.warn("Erreur lors de la vérification du manager, utilisation de la valeur par défaut");
      return { hasManager: true }; // Par défaut, on assume qu'un manager existe
    }
    
    return await res.json();
  } catch (error) {
    console.error("Erreur checkManagerExists:", error);
    return { hasManager: true }; // En cas d'erreur, on assume qu'un manager existe
  }
}

// Bloquer un utilisateur
export async function blockUserApi(userId, token) {
  if (!token) {
    throw new Error("Token d'authentification manquant");
  }
  
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  const res = await fetch(`${API_URL}/users/${userId}/block`, {
    method: "POST",
    headers
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors du blocage de l'utilisateur: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Débloquer un utilisateur
export async function unblockUserApi(userId, token) {
  console.log("unblockUserApi appelé pour userId:", userId);
  
  if (!token) {
    throw new Error("Token d'authentification manquant");
  }
  
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  try {
    const res = await fetch(`${API_URL}/users/${userId}/unblock`, {
      method: "POST",
      headers
    });
    
    console.log("Réponse unblockUserApi - Status:", res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erreur détaillée unblockUserApi:", {
        status: res.status,
        statusText: res.statusText,
        errorText: errorText
      });
      
      throw new Error(`Erreur ${res.status} lors du déblocage: ${errorText || res.statusText}`);
    }
    
    const data = await res.json();
    console.log("Réponse unblockUserApi:", data);
    return data;
    
  } catch (error) {
    console.error("Erreur dans unblockUserApi:", error);
    throw error;
  }
}

// Réinitialiser les tentatives échouées
export async function resetFailedAttemptsApi(userId, token) {
  if (!token) {
    throw new Error("Token d'authentification manquant");
  }
  
  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  const res = await fetch(`${API_URL}/users/${userId}/reset-attempts`, {
    method: "POST",
    headers
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la réinitialisation des tentatives: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Modifier le statut d'un signalement
export async function updateSignalementStatusApi(signalementId, newStatus, token) {
  if (!token) {
    throw new Error("Token d'authentification manquant");
  }
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  
  const res = await fetch(`${API_URL}/signalements/${signalementId}/status`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status: newStatus })
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la modification du statut: ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

// Synchronisation Firebase (Manager)
export async function syncSignalementsToFirebase(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/firebase/signalements/sync`, {
    method: "POST",
    headers
  });
  if (!res.ok) throw new Error("Erreur lors de la synchronisation vers Firebase");
  return await res.json();
}

export async function getSignalementsFromFirebase(token) {
  const headers = token ? { "Authorization": `Bearer ${token}` } : {};
  const res = await fetch(`${API_URL}/firebase/signalements`, {
    headers
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération depuis Firebase");
  return await res.json();
}

// Fonction pour tester l'authentification
export async function testAuthAndRole(token) {
  if (!token) {
    return { 
      authenticated: false, 
      message: "Aucun token trouvé" 
    };
  }
  
  try {
    // Test de l'authentification
    const authResponse = await fetch(`${API_URL}/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (authResponse.ok) {
      const userData = await authResponse.json();
      return {
        authenticated: true,
        user: userData,
        isManager: userData.role === 'manager' || userData.role === 'admin',
        message: `Authentifié en tant que ${userData.role || 'utilisateur'}`
      };
    } else {
      return {
        authenticated: false,
        status: authResponse.status,
        message: `Échec authentification: ${authResponse.status}`
      };
    }
  } catch (error) {
    return {
      authenticated: false,
      message: `Erreur: ${error.message}`
    };
  }
}

// Tester la connexion au backend
export async function testBackendConnection() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return {
      connected: res.ok,
      status: res.status,
      statusText: res.statusText
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Obtenir les informations de l'utilisateur connecté
export async function getCurrentUserApi(token) {
  if (!token) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Erreur getCurrentUserApi:", error);
    return null;
  }
}