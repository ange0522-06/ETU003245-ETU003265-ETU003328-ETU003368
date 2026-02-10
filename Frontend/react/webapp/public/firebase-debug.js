// 🔥 Script de Test et Diagnostic Firebase
// Utiliser ce script dans la console du navigateur pour tester la synchronisation

console.log('🔥 === TEST SYNCHRONISATION FIREBASE ===');

// Test 1: Vérifier la configuration Firebase
async function testFirebaseConfig() {
  console.log('📋 Test 1: Configuration Firebase...');
  
  try {
    const response = await fetch('/api/auth/sync-users-to-firebase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ Backend Firebase API accessible');
      const result = await response.json();
      console.log('📊 Résultat sync:', result);
      return true;
    } else {
      console.error('❌ Erreur API Backend:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur de connexion Backend:', error);
    return false;
  }
}

// Test 2: Vérifier les utilisateurs en base
async function testUsersInDB() {
  console.log('📋 Test 2: Utilisateurs en base PostgreSQL...');
  
  try {
    const response = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log(`✅ ${users.length} utilisateurs trouvés en base:`, 
        users.map(u => `${u.email} (${u.role})`));
      return users;
    } else {
      console.error('❌ Impossible de récupérer les utilisateurs');
      return [];
    }
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    return [];
  }
}

// Test 3: Test de synchronisation individuelle
async function testSyncSingleUser(email, password) {
  console.log(`📋 Test 3: Sync individuelle pour ${email}...`);
  
  // D'abord récupérer l'ID de l'utilisateur
  const users = await testUsersInDB();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error(`❌ Utilisateur ${email} non trouvé en base`);
    return false;
  }
  
  try {
    const response = await fetch(`/api/auth/sync-user-to-firebase/${user.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Sync réussie pour ${email}:`, result);
      return true;
    } else {
      console.error(`❌ Echec sync pour ${email}:`, result.message);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur sync ${email}:`, error);
    return false;
  }
}

// Test 4: Vérifier l'authentification mobile (si possible)
function testMobileAuthConfig() {
  console.log('📋 Test 4: Configuration Mobile Firebase...');
  
  // Vérifier si Firebase est chargé côté mobile
  if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase détecté côté client');
    
    // Vérifier la config
    const app = firebase.apps[0];
    if (app) {
      console.log('✅ Firebase App configurée:', {
        projectId: app.options.projectId,
        authDomain: app.options.authDomain
      });
    }
  } else {
    console.log('⚠️ Firebase non détecté côté client (normal pour interface web)');
  }
}

// Script principal de diagnostic
async function runDiagnostic() {
  console.log('🚀 === DIAGNOSTIC COMPLET ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Token présent:', !!localStorage.getItem('token'));
  
  // Exécuter tous les tests
  const configOK = await testFirebaseConfig();
  const users = await testUsersInDB();
  testMobileAuthConfig();
  
  console.log('📊 === RÉSUMÉ ===');
  console.log('Backend Firebase API:', configOK ? '✅ OK' : '❌ KO');
  console.log('Utilisateurs en base:', users.length);
  console.log('Prêt pour synchronisation:', configOK && users.length > 0 ? '✅ OUI' : '❌ NON');
  
  return {
    backendOK: configOK,
    usersCount: users.length,
    users: users.map(u => ({ email: u.email, role: u.role, id: u.id }))
  };
}

// Fonctions utiles pour le debug
window.firebaseDebug = {
  runDiagnostic,
  testFirebaseConfig,
  testUsersInDB,
  testSyncSingleUser,
  testMobileAuthConfig,
  
  // Raccourcis
  async quickSync(email, password) {
    console.log(`🚀 Quick Sync: ${email}`);
    return await testSyncSingleUser(email, password);
  },
  
  async syncAll() {
    console.log('🚀 Sync All Users');
    return await testFirebaseConfig();
  }
};

console.log('🔧 Fonctions de debug disponibles dans window.firebaseDebug');
console.log('📝 Exemples:');
console.log('  firebaseDebug.runDiagnostic()');
console.log('  firebaseDebug.quickSync("user@example.com", "password123")');
console.log('  firebaseDebug.syncAll()');

// Auto-run du diagnostic
runDiagnostic();