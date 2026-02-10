// Service de gestion des notifications pour les changements de statut
import { reactive } from 'vue';
import { apiService } from './api.js';

const notificationStore = reactive({
  notifications: [],
  unreadCount: 0
});

class NotificationService {
  constructor() {
    this.previousSignalements = new Map();
    this.currentUserId = null;
  }

  // Vérifier les changements de statut (local, depuis Firestore realtime)
  checkForStatusChanges(currentSignalements, currentUserId) {
    if (!currentUserId) return;

    currentSignalements.forEach(signalement => {
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

      this.previousSignalements.set(signalement.id, {
        id: signalement.id,
        status: signalement.status,
        titre: signalement.titre
      });
    });
  }

  addNotification(notification) {
    notificationStore.notifications.unshift(notification);
    notificationStore.unreadCount++;
    if (notificationStore.notifications.length > 50) notificationStore.notifications = notificationStore.notifications.slice(0,50);
    this.showBrowserNotification(notification);
  }

  // Marquer comme lu local + backend
  async markAsRead(notificationId) {
    const notification = notificationStore.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1);
      try {
        const numericId = Number(notificationId);
        if (!Number.isNaN(numericId)) await apiService.markNotificationAsRead(numericId);
      } catch (e) {
        console.warn('markAsRead backend failed', e);
      }
    }
  }

  async markAllAsRead() {
    notificationStore.notifications.forEach(n => n.isRead = true);
    notificationStore.unreadCount = 0;
    try { if (this.currentUserId) await apiService.markAllNotificationsAsRead(this.currentUserId); } catch(e){console.warn('markAllAsRead backend failed', e);}    
  }

  removeNotification(notificationId) {
    const index = notificationStore.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notificationStore.notifications[index];
      if (!notification.isRead) notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1);
      notificationStore.notifications.splice(index, 1);
    }
  }

  getStatusText(status) {
    const statusMap = {
      'nouveau': '🆕 Nouveau',
      'en cours': '⏳ En cours',
      'termine': '✅ Terminé'
    };
    return statusMap[status] || status;
  }

  async showBrowserNotification(notification) {
    if (!('Notification' in window)) return;
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(`Changement de statut - ${notification.title}`, {
        body: `Statut mis à jour: ${this.getStatusText(notification.oldStatus)} → ${this.getStatusText(notification.newStatus)}`,
        icon: '/favicon.ico',
        tag: `status-change-${notification.signalementId}`
      });
    }
  }

  getStore() { return notificationStore; }

  // Charger notifications persistées côté serveur
  async loadUserNotifications(userId) {
    if (!userId) return;
    this.currentUserId = userId;
    try {
      const remote = await apiService.getUserNotifications(userId);
      for (const r of remote) {
        const id = r.id || `srv-${r.signalementId}-${Date.parse(r.createdAt || new Date())}`;
        if (!notificationStore.notifications.find(n => String(n.id) === String(id))) {
          notificationStore.notifications.unshift({
            id: id,
            title: r.title,
            message: r.message,
            oldStatus: r.oldStatus || r.old_status || null,
            newStatus: r.newStatus || r.new_status || null,
            signalementId: r.signalementId,
            timestamp: r.createdAt || r.created_at || new Date().toISOString(),
            isRead: !!r.isRead
          });
          if (!r.isRead) notificationStore.unreadCount++;
        }
      }
      if (notificationStore.notifications.length > 50) notificationStore.notifications = notificationStore.notifications.slice(0,50);
    } catch (e) { console.warn('Failed to load user notifications', e); }
  }

  // Rafraîchir uniquement le compteur non lu depuis le backend et merge
  async refreshUnreadNotifications(userId) {
    if (!userId) return 0;
    try {
      const unread = await apiService.getUnreadNotifications(userId);
      if (!Array.isArray(unread)) return 0;
      for (const r of unread) {
        const id = r.id || `srv-${r.signalementId}-${Date.parse(r.createdAt || new Date())}`;
        if (!notificationStore.notifications.find(n => String(n.id) === String(id))) {
          notificationStore.notifications.unshift({
            id: id,
            title: r.title,
            message: r.message,
            oldStatus: r.oldStatus || r.old_status || null,
            newStatus: r.newStatus || r.new_status || null,
            signalementId: r.signalementId,
            timestamp: r.createdAt || r.created_at || new Date().toISOString(),
            isRead: !!r.isRead
          });
        }
      }
      const backendUnreadCount = unread.filter(n => !n.isRead).length;
      notificationStore.unreadCount = backendUnreadCount;
      if (notificationStore.notifications.length > 50) notificationStore.notifications = notificationStore.notifications.slice(0,50);
      return backendUnreadCount;
    } catch (e) { console.warn('Failed to refresh unread notifications', e); return 0; }
  }
}

export const notificationService = new NotificationService();
export { notificationStore };
