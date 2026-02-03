<template>
  <div class="notification-icon-container">
    <button 
      class="notification-btn"
      @click="toggleNotifications"
      :class="{ active: showNotifications }"
    >
      <div class="icon-wrapper">
        🔔
        <span v-if="unreadCount > 0" class="notification-badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </div>
    </button>

    <!-- Panel des notifications -->    
    <transition name="slide-fade">
      <div v-if="showNotifications" class="notifications-panel" @click.stop>
        <div class="panel-header">
          <h3>Notifications</h3>
          <div class="header-actions">
            <button v-if="unreadCount > 0" @click="markAllAsRead" class="btn-mark-all">
              Tout marquer comme lu
            </button>
            <button @click="showNotifications = false" class="btn-close">×</button>
          </div>
        </div>
        
        <div class="notifications-list" v-if="notifications.length > 0">
          <div 
            v-for="notification in notifications.slice(0, 10)" 
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.isRead }"
            @click="markAsRead(notification.id)"
          >
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">
                Statut mis à jour: 
                <span class="status-change">
                  {{ getStatusText(notification.oldStatus) }} → {{ getStatusText(notification.newStatus) }}
                </span>
              </div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <button 
              @click.stop="removeNotification(notification.id)"
              class="btn-remove"
            >
              ×
            </button>
          </div>
        </div>
        
        <div v-else class="no-notifications">
          <div class="empty-icon">🔕</div>
          <p>Aucune notification</p>
        </div>
      </div>
    </transition>
    
    <!-- Overlay pour fermer -->
    <div 
      v-if="showNotifications" 
      class="overlay" 
      @click="showNotifications = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { notificationService, notificationStore } from '../services/notificationService.js';

const showNotifications = ref(false);

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const markAsRead = (notificationId) => {
  notificationService.markAsRead(notificationId);
};

const markAllAsRead = () => {
  notificationService.markAllAsRead();
};

const removeNotification = (notificationId) => {
  notificationService.removeNotification(notificationId);
};

const getStatusText = (status) => {
  return notificationService.getStatusText(status);
};

const formatTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return time.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

// Fermer les notifications si on clique ailleurs
const handleClickOutside = (event) => {
  if (showNotifications.value && !event.target.closest('.notification-icon-container')) {
    showNotifications.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-icon-container {
  position: relative;
  z-index: 1000;
}

.notification-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.notification-btn:hover,
.notification-btn.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
}

.icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  width: 1.5rem;
  height: 1.5rem;
}

.notification-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  min-width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.notifications-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 350px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.panel-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-mark-all {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-mark-all:hover {
  background: rgba(59, 130, 246, 0.1);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.notification-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.notification-item.unread {
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid #3b82f6;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.notification-message {
  color: #64748b;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.status-change {
  font-weight: 600;
  color: #3b82f6;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.btn-remove {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.no-notifications {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Responsive */
@media (max-width: 480px) {
  .notifications-panel {
    width: 90vw;
    right: -1rem;
  }
}
</style>