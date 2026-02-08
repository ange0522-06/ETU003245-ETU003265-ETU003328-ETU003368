// Service de gestion des notifications pour les changements de statut
import { reactive } from 'vue';

const notificationStore = reactive({
  notifications: [],
  unreadCount: 0
});

class NotificationService {
  constructor() {
    this.previousSignalements = new Map();
  }

  // Vérifier les changements de statut
  checkForStatusChanges(currentSignalements, currentUserId) {
    if (!currentUserId) return;

    currentSignalements.forEach(signalement => {
      // Filtrer seulement les signalements de l'utilisateur actuel
      if (signalement.userId !== currentUserId) return;

      const previous = this.previousSignalements.get(signalement.id);
      
      if (previous && previous.status !== signalement.status) {
        this.addNotification({
          id: `status-${signalement.id}-${Date.now()}`,
          type: 'status-change',
          signalementId: signalement.id,
          title: signalement.titre || 'Signalement',
          oldStatus: previous.status,
          newStatus: signalement.status,
          timestamp: new Date().toISOString(),
          isRead: false
        });
      }
      
      // Mettre à jour le cache
      this.previousSignalements.set(signalement.id, {
        id: signalement.id,
        status: signalement.status,
        titre: signalement.titre
      });
    });
  }

  // Ajouter une nouvelle notification
  addNotification(notification) {
    notificationStore.notifications.unshift(notification);
    notificationStore.unreadCount++;
    
    // Limiter à 50 notifications max
    if (notificationStore.notifications.length > 50) {
      notificationStore.notifications = notificationStore.notifications.slice(0, 50);
    }

    // Notification native du navigateur si autorisée
    this.showBrowserNotification(notification);
  }

  // Marquer une notification comme lue
  markAsRead(notificationId) {
    const notification = notificationStore.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1);
    }
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead() {
    notificationStore.notifications.forEach(n => n.isRead = true);
    notificationStore.unreadCount = 0;
  }

  // Supprimer une notification
  removeNotification(notificationId) {
    const index = notificationStore.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notificationStore.notifications[index];
      if (!notification.isRead) {
        notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1);
      }
      notificationStore.notifications.splice(index, 1);
    }
  }

  // Obtenir le texte de statut formaté
  getStatusText(status) {
    const statusMap = {
      'nouveau': '🆕 Nouveau',
      'en cours': '⏳ En cours',
      'termine': '✅ Terminé'
    };
    return statusMap[status] || status;
  }

  // Afficher notification native du navigateur
  async showBrowserNotification(notification) {
    if ('Notification' in window) {
      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
        new Notification(`Changement de statut - ${notification.title}`, {
          body: `Statut mis à jour: ${this.getStatusText(notification.oldStatus)} → ${this.getStatusText(notification.newStatus)}`,
          icon: '/favicon.ico',
          tag: `status-change-${notification.signalementId}`,
          requireInteraction: false
        });
      }
    }
  }

  // Obtenir le store réactif
  getStore() {
    return notificationStore;
  }
}

export const notificationService = new NotificationService();
export { notificationStore };