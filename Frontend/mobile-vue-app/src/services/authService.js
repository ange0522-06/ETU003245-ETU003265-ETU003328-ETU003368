import { ref, reactive } from 'vue';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getFirestore 
} from 'firebase/firestore';

// Importer la configuration Firebase existante
import '../firebase.js';

const auth = getAuth();
const db = getFirestore();

class AuthService {
  constructor() {
    this.isLoggedIn = ref(false);
    this.currentUser = ref(null);
    this.authToken = ref(null);
    this.userProfile = reactive({
      uid: null,
      id: null,
      email: null,
      role: null,
      nom: null,
      permissions: []
    });
    this.initialized = false;
  }

  // Initialiser le service d'authentification avec Firebase
  initializeAuth() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    // Écouter les changements d'état d'authentification Firebase
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.isLoggedIn.value = true;
        this.currentUser.value = user;
        this.authToken.value = await user.getIdToken();
        
        // Récupérer le profil utilisateur depuis Firestore
        await this.loadUserProfile(user.uid);
      } else {
        this.isLoggedIn.value = false;
        this.currentUser.value = null;
        this.authToken.value = null;
        this.clearUserProfile();
      }
    });
  }

  // Prépare le mot de passe pour Firebase (minimum 6 caractères)
  preparePasswordForFirebase(password) {
    if (!password || password.length >= 6) {
      return password;
    }
    // Padder le mot de passe avec des zéros pour atteindre 6 caractères
    const paddedPassword = password + '000000'.substring(0, 6 - password.length);
    console.log('🔑 Mot de passe paddé pour Firebase:', password, '->', paddedPassword);
    return paddedPassword;
  }

  // Connexion avec email/mot de passe via Firebase Auth
  async login(email, password) {
    try {
      // D'abord essayer avec le mot de passe tel quel
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (firstError) {
        // Si le mot de passe fait moins de 6 caractères, essayer avec le mot de passe paddé
        if (password.length < 6 && (firstError.code === 'auth/wrong-password' || firstError.code === 'auth/invalid-credential')) {
          const paddedPassword = this.preparePasswordForFirebase(password);
          console.log('🔄 Tentative avec mot de passe paddé...');
          userCredential = await signInWithEmailAndPassword(auth, email, paddedPassword);
        } else {
          throw firstError;
        }
      }
      
      const user = userCredential.user;
      
      // Le profil sera chargé automatiquement via onAuthStateChanged
      console.log('✅ Connexion Firebase réussie pour:', email);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          role: this.userProfile.role
        }
      };
    } catch (error) {
      console.error('Erreur lors de la connexion Firebase:', error);
      
      let errorMessage = 'Email ou mot de passe incorrect';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Utilisateur non trouvé. Contactez l\'administrateur.';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Compte désactivé. Contactez l\'administrateur.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Déconnexion
  async logout() {
    try {
      await signOut(auth);
      this.clearUserProfile();
      console.log('✅ Déconnexion Firebase réussie');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion Firebase:', error);
      this.clearUserProfile(); // Forcer la déconnexion locale
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Charger le profil utilisateur depuis Firestore
  async loadUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        this.updateUserProfile({
          uid: uid,
          id: profileData.id,
          email: profileData.email,
          role: profileData.role,
          nom: profileData.email
        });
        console.log('✅ Profil utilisateur chargé:', profileData.role);
      } else {
        console.warn('⚠️ Profil utilisateur non trouvé dans Firestore');
        // Utiliser les données Firebase Auth basiques
        this.updateUserProfile({
          uid: uid,
          email: this.currentUser.value?.email,
          role: 'user' // rôle par défaut
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      // Utiliser les données Firebase Auth basiques en cas d'erreur
      this.updateUserProfile({
        uid: uid,
        email: this.currentUser.value?.email,
        role: 'user'
      });
    }
  }

  // Mettre à jour le profil utilisateur
  updateUserProfile(user) {
    this.userProfile.uid = user.uid;
    this.userProfile.id = user.id;
    this.userProfile.email = user.email;
    this.userProfile.role = user.role;
    this.userProfile.nom = user.nom || user.name || user.email || '';
    
    // Définir les permissions selon le rôle
    this.userProfile.permissions = this.getPermissionsForRole(user.role);
  }

  // Obtenir les permissions selon le rôle
  getPermissionsForRole(role) {
    const rolePermissions = {
      'user': ['mobile_access', 'create_reports', 'view_own_reports'],
      'agent': ['mobile_access', 'web_access', 'manage_reports', 'update_status'],
      'manager': ['mobile_access', 'web_access', 'manage_all_reports', 'manage_users', 'view_statistics'],
      'admin': ['mobile_access', 'web_access', 'full_access']
    };
    
    return rolePermissions[role] || [];
  }

  // Vérifier si l'utilisateur peut accéder à l'app mobile
  canAccessMobileApp() {
    const allowedRoles = ['user', 'agent', 'manager', 'admin'];
    return this.userProfile.role && allowedRoles.includes(this.userProfile.role);
  }

  // Vérifier une permission spécifique
  hasPermission(permission) {
    return this.userProfile.permissions.includes(permission);
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    return this.userProfile.role === role;
  }

  // Effacer le profil utilisateur
  clearUserProfile() {
    this.userProfile.uid = null;
    this.userProfile.id = null;
    this.userProfile.email = null;
    this.userProfile.role = null;
    this.userProfile.nom = null;
    this.userProfile.permissions = [];
  }

  // Obtenir le token d'authentification Firebase
  async getAuthToken() {
    if (this.currentUser.value) {
      try {
        return await this.currentUser.value.getIdToken();
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        return null;
      }
    }
    return null;
  }

  // Obtenir les headers d'authentification pour les requêtes API
  async getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Rafraîchir le profil utilisateur
  async refreshProfile() {
    if (this.currentUser.value) {
      try {
        await this.loadUserProfile(this.currentUser.value.uid);
        return true;
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du profil:', error);
        return false;
      }
    }
    return false;
  }

  // Récupérer les informations détaillées de l'utilisateur
  async getUserDetails() {
    return {
      uid: this.userProfile.uid,
      id: this.userProfile.id,
      email: this.userProfile.email,
      role: this.userProfile.role,
      nom: this.userProfile.nom
    };
  }

  // Envoyer un email de réinitialisation de mot de passe
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Email de réinitialisation envoyé'
      };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email de réinitialisation'
      };
    }
  }

  // Vérifier si l'utilisateur est connecté (pour compatibilité)
  get isAuthenticated() {
    return this.isLoggedIn.value;
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService();

// Export par défaut pour la compatibilité
export default authService;