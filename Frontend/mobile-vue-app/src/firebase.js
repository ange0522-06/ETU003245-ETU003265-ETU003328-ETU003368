// Firebase configuration and initialization for Vue

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyBJshlbmDJr-v4MLW7iypcBiI4d60l39C4', // à récupérer dans la console Firebase (clé pubfais en francaislique)
  authDomain: 'cloud-a3fb6.firebaseapp.com',
  projectId: 'cloud-a3fb6',
  storageBucket: 'cloud-a3fb6.appspot.com',
  messagingSenderId: '284786952403', // à compléter
  appId: '1:284786952403:web:ff633ef9658d575999ec26', // à compléter
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Tentative de connexion anonyme en dev — activez Anonymous dans
// Firebase Console → Authentication → Sign-in method si nécessaire.
// Attempt anonymous sign-in (single call) and log result for debugging.
signInAnonymously(auth)
  .then((cred) => {
    console.log('Anonymous sign-in success, uid=', cred.user && cred.user.uid);
  })
  .catch((err) => {
    console.warn('Anonymous sign-in failed:', err);
  });
const db = getFirestore(app);

export { app, auth, db };