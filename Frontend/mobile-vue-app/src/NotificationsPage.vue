<template>
  <ion-page class="notifications-content">
    <!-- Top Navigation -->
    <div class="top-navigation">
      <div class="nav-container">
        <div class="logo-section">
          <ion-icon name="map" class="app-logo"></ion-icon>
          <span class="app-name">SignalRoad</span>
        </div>
        
        <nav class="nav-menu">
          <a @click="goToHome" :class="['nav-link', { active: currentRoute === 'home' }]">
            Accueil
          </a>
          <a @click="goToMap" :class="['nav-link', { active: currentRoute === 'map' }]">
            Carte
          </a>
          <a @click="goToMyReports" :class="['nav-link', { active: currentRoute === 'reports' }]">
            Mes Signalements
          </a>
          <a @click="goToNotifications" :class="['nav-link notification-link active', { active: currentRoute === 'notifications' }]">
            <span class="notification-icon">
              <ion-icon name="notifications"></ion-icon>
              <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
            </span>
            Notifications
          </a>
        </nav>

        <div class="header-actions">
          <div class="user-info">
            <span class="greeting">{{ getTimeGreeting() }}, {{ userName }}</span>
          </div>
          <div class="user-menu" @click="goToProfile">
            <div class="user-avatar">
              <ion-icon name="person" style="font-size: 24px; color: white;"></ion-icon>
            </div>
          </div>
          <ion-button 
            @click="markAllAsRead" 
            v-if="unreadCount > 0"
            fill="clear"
            style="color: white; margin-left: 16px;"
          >
            <ion-icon name="checkmark-done-outline" style="margin-right: 8px;"></ion-icon>
            Tout marquer comme lu
          </ion-button>
        </div>
      </div>
    </div>

    <ion-content>
      <div class="notifications-container" v-if="notifications.length > 0">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.isRead }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <ion-icon :name="getNotificationIcon(notification.type)"></ion-icon>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
          </div>
          <div class="notification-actions">
            <ion-button 
              fill="clear" 
              size="small"
              @click.stop="removeNotification(notification.id)"
            >
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <ion-icon name="notifications-off-outline" class="empty-icon"></ion-icon>
        <h3>Aucune notification</h3>
        <p>Vous n'avez aucune nouvelle notification pour le moment.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonTitle, 
  IonContent, 
  IonIcon,
  IonButton,
  IonButtons,
  IonBackButton
} from '@ionic/vue';
import BottomNav from './components/BottomNav.vue';

const router = useRouter();

// Navigation
const goToHome = () => {
  router.push('/home');
};

const goToMyReports = () => {
  router.push('/my-reports');
};

const goToMap = () => {
  router.push('/map');
}; 

const goToNotifications = () => {
  router.push('/notifications');
};

const goToProfile = () => {
  console.log('Navigate to Profile');
};

// User et UI Info
const userName = ref('Utilisateur');
const notificationCount = ref(3);
const currentRoute = 'notifications';

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const notifications = ref([
  {
    id: 1,
    title: "Signalement mis à jour",
    message: "Votre signalement de nid-de-poule sur Avenue Independence a été pris en charge",
    type: "status_update",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: 2,
    title: "Nouveau signalement",
    message: "Un nouveau signalement a été créé près de votre zone",
    type: "new_report",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: 3,
    title: "Signalement résolu",
    message: "Le signalement de route endommagée sur Rue de la Paix a été résolu",
    type: "resolved",
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  }
]);

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.isRead).length
);

const markAsRead = (id) => {
  const notification = notifications.value.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
  }
};

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.isRead = true;
  });
};

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};

const getNotificationIcon = (type) => {
  const iconMap = {
    status_update: 'refresh-circle-outline',
    new_report: 'add-circle-outline',
    resolved: 'checkmark-circle-outline',
    default: 'notifications-outline'
  };
  return iconMap[type] || iconMap.default;
};

const formatTime = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  } else if (hours < 24) {
    return `Il y a ${hours} h`;
  } else {
    return `Il y a ${days} j`;
  }
};

onMounted(() => {
  // En production, récupérer les notifications depuis l'API
  console.log('Notifications loaded');
});
</script>

<style scoped>
.notifications-content {
  --background: #f5f5f5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Top Navigation */
.top-navigation {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo {
  font-size: 32px;
  color: #fbbf24;
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.notification-link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.notification-icon ion-icon {
  font-size: 18px;
}

.notification-icon .notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info .greeting {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.user-menu {
  cursor: pointer;
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}

.notifications-container {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  border-left-color: #2563eb;
  background: #f8fafc;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-icon {
  margin-right: 12px;
  padding-top: 4px;
}

.notification-icon ion-icon {
  font-size: 24px;
  color: #2563eb;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 16px;
}

.notification-message {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-time {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.notification-actions {
  margin-left: 12px;
  display: flex;
  align-items: center;
}

.notification-actions ion-button {
  --color: #6b7280;
  --color-hover: #ef4444;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 20px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-item {
    padding: 12px;
  }
  
  .notification-title {
    font-size: 15px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>