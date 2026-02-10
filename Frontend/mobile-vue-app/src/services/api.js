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

  // Écouter les changements en temps réel depuis Firebase pour un utilisateur spécifique
  subscribeToUserSignalements(userId, callback, onError) {
    console.log('👤 Écoute des signalements pour utilisateur:', userId);

    const unsubscribe = onSnapshot(
      collection(db, 'signalements'),
      (snapshot) => {
        const allSignalements = [];
        const userSignalements = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const signalement = {
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
          };

          allSignalements.push(signalement);

          // Pour l'instant, montrer tous les signalements (filtrage utilisateur à implémenter plus tard)
          userSignalements.push(signalement);
        });

        console.log('🔄 Mise à jour temps réel Firebase:', allSignalements.length, 'signalements récupérés');
        console.log('📋 Échantillon de données:', allSignalements.slice(0, 3).map(s => ({
          id: s.id,
          titre: s.titre,
          status: s.status,
          userId: s.userId,
          id_user: s.id_user
        })));

        callback(userSignalements);
      },
      (error) => {
        console.error('❌ Erreur écoute Firebase:', error);
        if (onError) onError(error);
        // Fallback: essayer de récupérer statiquement
        this.getSignalementsFromFirebase().then(signalements => {
          console.log('🔄 Fallback: récupération statique de', signalements.length, 'signalements');
          callback(signalements);
        }).catch(() => callback([]));
      }
    );
    return unsubscribe;
  },

  // Méthode dépréciée - gardée pour compatibilité
  subscribeToSignalements(callback) {
    console.warn('⚠️ subscribeToSignalements est dépréciée, utilisez subscribeToUserSignalements');
    return this.subscribeToUserSignalements(null, callback);
  },

  // Ajouter un nouveau signalement dans Firebase (créé depuis mobile)
  async addSignalementToFirebase(signalement) {
    try {
      // Préparer les données en s'assurant que photos est un tableau
      const signalementData = {
        ...signalement,
        photos: Array.isArray(signalement.photos) ? signalement.photos : [],
        dateSignalement: new Date().toISOString(),
        statut: 'nouveau'
      };
      
      console.log('📤 Données à envoyer:', { 
        ...signalementData, 
        photos: '(photos: ' + signalementData.photos.length + ' files)' 
      });
      
      const docRef = await addDoc(collection(db, 'signalements'), signalementData);
      console.log('✅ Signalement ajouté dans Firebase:', docRef.id);
      return { id: docRef.id, ...signalementData };
    } catch (error) {
      console.error('❌ Erreur ajout Firebase:', error);
      console.error('❌ Détails erreur:', error.message);
      throw new Error(`Erreur Firebase: ${error.message}`);
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

  // Mettre à jour un signalement dans Firebase
  async updateSignalementInFirebase(signalementId, updateData) {
    try {
      console.log('Début de la mise à jour Firebase:', signalementId, updateData);
      
      if (!signalementId) {
        throw new Error('ID du signalement manquant');
      }
      
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      const signalementRef = doc(db, 'signalements', signalementId.toString());
      await updateDoc(signalementRef, updateData);
      
      console.log('✅ Signalement mis à jour dans Firebase:', signalementId, updateData);
      return true;
    } catch (error) {
      console.error('❌ Erreur détaillée mise à jour Firebase:', {
        error: error,
        message: error.message,
        code: error.code,
        signalementId: signalementId,
        updateData: updateData
      });
      throw error;
    }
  },

  // Simple update without strict Firebase rules
  async updateSignalementSimple(signalementId, updateData) {
    try {
      console.log('Mise à jour simple:', signalementId, updateData);
      
      // Store locally first
      const localStorageKey = `signalement_${signalementId}`;
      const existingData = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
      const mergedData = { ...existingData, ...updateData };
      localStorage.setItem(localStorageKey, JSON.stringify(mergedData));
      
      // Try Firebase update but don't fail if it doesn't work
      try {
        const signalementRef = doc(db, 'signalements', signalementId.toString());
        await updateDoc(signalementRef, updateData);
        console.log('✅ Firebase update successful');
      } catch (fbError) {
        console.warn('⚠️ Firebase update failed, but local storage updated:', fbError.message);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Update failed:', error);
      throw error;
    }
  },

  // Fonction simple pour mise à jour sans restrictions de permissions
  async updateSignalementSimple(signalementId, updateData) {
    try {
      console.log('Mise à jour simple Firebase:', signalementId, updateData);
      
      // Validation de base
      if (!signalementId || !updateData) {
        throw new Error('Données manquantes');
      }
      
      // Pour les utilisateurs normaux, limiter les champs modifiables
      const userEditableFields = {
        titre: updateData.titre,
        description: updateData.description,
        type: updateData.type,  
        photos: updateData.photos,
        dateModification: new Date().toISOString()
      };
      
      // Supprimer les champs undefined
      Object.keys(userEditableFields).forEach(key => {
        if (userEditableFields[key] === undefined) {
          delete userEditableFields[key];
        }
      });
      
      if (updateData.date) {
        userEditableFields.dateSignalement = updateData.date;
      }
      
      // Utiliser setDoc avec merge pour éviter les problèmes de permissions
      const signalementRef = doc(db, 'signalements', signalementId.toString());
      
      // Importer setDoc
      const { setDoc } = await import('firebase/firestore');
      await setDoc(signalementRef, userEditableFields, { merge: true });
      
      console.log('✅ Mise à jour réussie:', signalementId);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur mise à jour simple:', error);
      throw error;
    }
  },

  // Mettre à jour un signalement dans Firebase (pour utilisateurs - champs limités)
  async updateUserSignalementInFirebase(signalementId, updateData) {
    try {
      console.log('Début de la mise à jour utilisateur Firebase:', signalementId, updateData);
      
      if (!signalementId) {
        throw new Error('ID du signalement manquant');
      }
      
      if (!updateData || Object.keys(updateData).length === 0) {
        return { success: false, error: 'Aucune donnée à mettre à jour' };
      }
      
      // Champs autorisés pour les utilisateurs (pas de surface, budget, entreprise)
      const allowedFields = ['titre', 'description', 'type', 'photos', 'dateSignalement', 'dateModification'];
      const filteredData = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });
      
      if (Object.keys(filteredData).length === 0) {
        return { success: false, error: 'Aucun champ modifiable détecté' };
      }
      
      const signalementRef = doc(db, 'signalements', signalementId.toString());
      await updateDoc(signalementRef, filteredData);
      
      console.log('✅ Signalement utilisateur mis à jour dans Firebase:', signalementId, filteredData);
      return { success: true, data: filteredData };
    } catch (error) {
      console.error('❌ Erreur détaillée mise à jour utilisateur Firebase:', {
        error: error,
        message: error.message,
        code: error.code,
        signalementId: signalementId,
        updateData: updateData
      });
      return { success: false, error: error.message };
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

  // Notifications endpoints
  async getUserNotifications(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user notifications');
      return await res.json();
    } catch (e) { console.warn('getUserNotifications failed', e); return []; }
  },

  async getUnreadNotifications(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread`);
      if (!res.ok) throw new Error('Failed to fetch unread notifications');
      return await res.json();
    } catch (e) { console.warn('getUnreadNotifications failed', e); return []; }
  },

  async markNotificationAsRead(notificationId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return await res.json();
    } catch (e) { console.warn('markNotificationAsRead failed', e); return null; }
  },

  async markAllNotificationsAsRead(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to mark all notifications as read');
      return await res.json();
    } catch (e) { console.warn('markAllNotificationsAsRead failed', e); return null; }
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
