<template>
  <div class="bottom-nav">
    <div :class="['nav-item', { active: currentRoute === 'Home' }]" @click="goTo('Home')">
      <ion-icon name="home"></ion-icon>
      <span>Accueil</span>
    </div>
    <div :class="['nav-item', { active: currentRoute === 'Map' }]" @click="goTo('Map')">
      <ion-icon name="map-outline"></ion-icon>
      <span>Carte</span>
    </div>
    <div class="nav-item fab-item" @click="goToNewReport">
      <div class="fab-btn">
        <ion-icon name="add"></ion-icon>
      </div>
    </div>
    <div :class="['nav-item', { active: currentRoute === 'MyReports' }]" @click="goTo('MyReports')">
      <ion-icon name="document-text-outline"></ion-icon>
      <span>Signalements</span>
    </div>
    <div :class="['nav-item', { active: currentRoute === 'Notifications' }]" @click="goToNotifications">
      <div class="notification-wrapper">
        <ion-icon name="notifications"></ion-icon>
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </div>
      <span>Notifications</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';

const router = useRouter();
const route = useRoute();
const notificationCount = ref(0);

const currentRoute = computed(() => route.name);

const goTo = (name) => {
  router.push({ name });
};

const goToNewReport = () => {
  router.push({ name: 'Map', query: { action: 'new' } });
};

const goToNotifications = () => {
  router.push({ name: 'Notifications' });
};

// Simuler le comptage des notifications (à remplacer par une vraie logique)
onMounted(() => {
  // Exemple : récupérer le nombre de notifications non lues
  notificationCount.value = 3; // À remplacer par un appel API
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(70px + var(--ion-safe-area-bottom, 0px));
  padding-bottom: var(--ion-safe-area-bottom, 0px);
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.nav-item.active {
  color: #2563eb;
}

.nav-item ion-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 10px;
  font-weight: 500;
}

.fab-item {
  position: relative;
  top: -20px;
}

.fab-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
}

.fab-btn ion-icon {
  font-size: 28px;
  color: white;
}

/* Notification styles */
.notification-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
</style>
