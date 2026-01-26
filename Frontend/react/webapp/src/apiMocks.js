// Exemple de mocks pour simuler les appels API

export function mockLogin(email, password) {
  // Simule une réponse API après 500ms
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        if (email.includes("manager")) {
          resolve({ success: true, role: "manager", token: "fake-jwt-manager" });
        } else {
          resolve({ success: true, role: "utilisateur", token: "fake-jwt-user" });
        }
      } else {
        reject({ success: false, message: "Identifiants invalides" });
      }
    }, 500);
  });
}

export function mockRegister(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({ success: true, role: "utilisateur", token: "fake-jwt-user" });
      } else {
        reject({ success: false, message: "Erreur d'inscription" });
      }
    }, 500);
  });
}

export function mockGetSignalements() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, date: "2026-01-01", status: "nouveau", surface: 20, budget: 1000, entreprise: "ABC" },
        { id: 2, date: "2026-01-10", status: "en cours", surface: 50, budget: 3000, entreprise: "XYZ" },
      ]);
    }, 500);
  });
}

export function mockGetStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ nbPoints: 2, totalSurface: 70, avancement: 50, totalBudget: 4000 });
    }, 500);
  });
}
