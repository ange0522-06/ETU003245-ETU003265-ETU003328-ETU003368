// Firebase configuration and initialization for Vue

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBJshlbmDJr-v4MLW7iypcBiI4d60l39C4',
  authDomain: 'cloud-a3fb6.firebaseapp.com',
  projectId: 'cloud-a3fb6',
  storageBucket: 'cloud-a3fb6.appspot.com',
  messagingSenderId: '284786952403',
  appId: '1:284786952403:web:ff633ef9658d575999ec26',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Debug: Vérifier la connexion Firebase
console.log('🔥 Firebase initialisé:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  timestamp: new Date().toISOString()
});

// Écouter les erreurs d'authentification
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('🔥 Utilisateur Firebase connecté:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });
  } else {
    console.log('🔥 Aucun utilisateur Firebase connecté');
  }
});

export { app, auth, db };