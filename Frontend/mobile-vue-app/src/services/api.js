// API service for fetching reports/points data
// Supporte à la fois le backend REST et Firebase Firestore

import { db } from '../firebase.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const API_BASE_URL = 'http://localhost:8080/api'; // Adjust based on your backend URL

export const apiService = {
  // ==================== FIREBASE FIRESTORE ====================
  
  // Récupérer tous les signalements depuis Firebase (synchronisés par le Manager)
  async getSignalementsFromFirebase() {
    try {
      const querySnapshot = await getDocs(collection(db, 'signalements'));
      const signalements = [];
      querySnapshot.forEach((doc) => {
        const data = doc.getData ? doc.getData() : doc.data();
        signalements.push({
          id: doc.id,
          idSignalement: data.idSignalement || doc.id,
          latitude: data.latitude,
          longitude: data.longitude,
          titre: data.titre || 'Signalement',
          description: data.description || '',
            status: data.statut || data.status || 'nouveau',
          date: data.dateSignalement ? data.dateSignalement.split('T')[0] : '',
          surface: data.surfaceM2 || data.surface,
          budget: data.budget,
          entreprise: data.entreprise,
            id_user: data.id_user,
            userId: data.id_user || data.userId || null,
          type: data.type || 'non spécifié'
        });
      });
      console.log('✅ Signalements récupérés depuis Firebase:', signalements.length);
      return signalements;
    } catch (error) {
      console.error('❌ Erreur Firebase:', error);
      throw error;
    }
  },

  // Écouter les changements en temps réel depuis Firebase
  subscribeToSignalements(callback) {
    const unsubscribe = onSnapshot(collection(db, 'signalements'), (snapshot) => {
      const signalements = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        signalements.push({
          id: doc.id,
          idSignalement: data.idSignalement || doc.id,
          latitude: data.latitude,
          longitude: data.longitude,
          titre: data.titre || 'Signalement',
          description: data.description || '',
          status: data.statut || data.status || 'nouveau',
          date: data.dateSignalement ? data.dateSignalement.split('T')[0] : '',
          surface: data.surfaceM2 || data.surface,
          budget: data.budget,
          entreprise: data.entreprise,
          id_user: data.id_user,
          userId: data.id_user || data.userId || null,
          type: data.type || 'non spécifié'
        });
      });
      console.log('🔄 Mise à jour temps réel Firebase:', signalements.length, 'signalements');
      callback(signalements);
    }, (error) => {
      console.error('❌ Erreur écoute Firebase:', error);
    });
    return unsubscribe;
  },

  // Ajouter un nouveau signalement dans Firebase (créé depuis mobile)
  async addSignalementToFirebase(signalement) {
    try {
      const docRef = await addDoc(collection(db, 'signalements'), {
        ...signalement,
        dateSignalement: new Date().toISOString(),
        statut: 'nouveau'
      });
      console.log('✅ Signalement ajouté dans Firebase:', docRef.id);
      return { id: docRef.id, ...signalement };
    } catch (error) {
      console.error('❌ Erreur ajout Firebase:', error);
      throw error;
    }
  },

  // Supprimer un signalement depuis Firebase
  async deleteSignalementFromFirebase(signalementId) {
    try {
      await deleteDoc(doc(db, 'signalements', signalementId));
      console.log('✅ Signalement supprimé de Firebase:', signalementId);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression Firebase:', error);
      throw error;
    }
  },

  // ==================== BACKEND REST API ====================

  // Fetch all reports/points from backend
  async getReports() {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Return mock data if backend is not available
      return this.getMockReports();
    }
  },

  // Mock data for development
  getMockReports() {
    return [
      {
        id: 1,
        latitude: -18.8792,
        longitude: 47.5079,
        titre: "Route endommagée",
        status: "en cours",
        date: "2026-01-15",
        surface: 20,
        budget: 1000,
        entreprise: "ABC Construction"
      },
      {
        id: 2,
        latitude: -18.9100,
        longitude: 47.5250,
        titre: "Travaux de revêtement",
        status: "nouveau",
        date: "2026-01-20",
        surface: 50,
        budget: 3000,
        entreprise: "XYZ Travaux"
      },
      {
        id: 3,
        latitude: -18.8650,
        longitude: 47.5350,
        titre: "Réparation de pont",
        status: "termine",
        date: "2026-01-10",
        surface: 100,
        budget: 5000,
        entreprise: "InfraPlus"
      },
      {
        id: 4,
        latitude: -18.8950,
        longitude: 47.5200,
        titre: "Aménagement trottoir",
        status: "en cours",
        date: "2026-01-25",
        surface: 30,
        budget: 1500,
        entreprise: "UrbanDev"
      }
    ];
  }
};
