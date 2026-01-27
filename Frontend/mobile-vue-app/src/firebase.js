// Firebase configuration and initialization for Vue

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyBJshlbmDJr-v4MLW7iypcBiI4d60l39C4', // à récupérer dans la console Firebase (clé publique)
  authDomain: 'cloud-a3fb6.firebaseapp.com',
  projectId: 'cloud-a3fb6',
  storageBucket: 'cloud-a3fb6.appspot.com',
  messagingSenderId: '284786952403', // à compléter
  appId: '1:284786952403:web:ff633ef9658d575999ec26', // à compléter
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };