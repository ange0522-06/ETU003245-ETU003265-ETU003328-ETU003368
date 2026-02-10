<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <!-- Top Navigation -->
      <div class="top-navigation">
        <div class="nav-container">
          <div class="logo-section">
            <button class="back-btn" @click="goBack" title="Retour">
              <ion-icon name="arrow-back"></ion-icon>
              <span class="back-text">Retour</span>
            </button>
            <ion-icon name="car-sport" class="app-logo"></ion-icon>
            <span class="app-name">RoadSignal</span>
          </div>
          
          <nav class="nav-menu">
            <a href="#" class="nav-link active" @click="goToHome">Accueil</a>
            <a href="#" class="nav-link" @click="goToMyReports">Mes signalements</a>
            <a href="#" class="nav-link" @click="goToMap">Carte</a>
            <a href="#" class="nav-link notification-link" @click="goToNotifications">
              <div class="notification-icon">
                <ion-icon name="notifications"></ion-icon>
                <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
              </div>
            </a>
          </nav>
          
          <div class="header-actions">
            <div class="user-info">
              <span class="greeting">{{ getTimeGreeting() }}, {{ userName }}</span>
            </div>
            <div class="user-menu" @click="goToProfile">
              <div class="user-avatar">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Tableau de bord</h1>
          <p class="hero-subtitle">Gérez vos signalements routiers en temps réel</p>
        </div>
      </div>
      
      <!-- Main Dashboard -->
      <div class="dashboard-container">
        <!-- Stats Overview -->
        <div class="stats-section">
          <div class="stat-card reports">
            <div class="stat-header">
              <ion-icon name="document-text" class="stat-icon"></ion-icon>
              <h3>Total Signalements</h3>
            </div>
            <div class="stat-value">{{ myReportsCount }}</div>
            <div class="stat-trend">+5% ce mois</div>
          </div>
          
          <div class="stat-card resolved">
            <div class="stat-header">
              <ion-icon name="checkmark-circle" class="stat-icon"></ion-icon>
              <h3>Résolus</h3>
            </div>
            <div class="stat-value">{{ resolvedCount }}</div>
            <div class="stat-trend">+12% ce mois</div>
          </div>
          
          <div class="stat-card pending">
            <div class="stat-header">
              <ion-icon name="time" class="stat-icon"></ion-icon>
              <h3>En cours</h3>
            </div>
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-trend">-3% ce mois</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2 class="section-title">Actions rapides</h2>
          <div class="action-buttons">
            <button class="action-btn primary" @click="goToMap('new')">
              <div class="action-icon-wrapper">
                <ion-icon name="add-circle"></ion-icon>
              </div>
              <div class="action-content">
                <h4>Nouveau signalement</h4>
                <p>Créer un nouveau rapport</p>
              </div>
            </button>

            <button class="action-btn tertiary" @click="goToMyReports">
              <div class="action-icon-wrapper">
                <ion-icon name="analytics"></ion-icon>
              </div>
              <div class="action-content">
                <h4>Rapports</h4>
                <p>Analyser les données</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="reports-section">
          <div class="section-header">
            <h2 class="section-title">Activité récente</h2>
            <button class="view-all-btn" @click="goToMyReports">
              <span>Tout voir</span>
              <ion-icon name="arrow-forward"></ion-icon>
            </button>
          </div>
          
          <div v-if="loading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Chargement des données...</p>
          </div>
          
          <div v-else-if="recentReports.length === 0" class="empty-container">
            <div class="empty-illustration">
              <ion-icon name="document-text-outline"></ion-icon>
            </div>
            <h3>Aucun signalement</h3>
            <p>Commencez par créer votre premier signalement routier</p>
            <button class="create-btn" @click="goToMap('new')">
              <ion-icon name="add"></ion-icon>
              Créer un signalement
            </button>
          </div>
          
          <div v-else class="reports-grid">
            <div v-for="report in recentReports" :key="report.id" 
                 class="report-card" @click="viewReport(report)">
              <div class="report-header">
                <div class="report-type">
                  <ion-icon name="location"></ion-icon>
                  <span>{{ report.type || 'Signalement' }}</span>
                </div>
                <span :class="['status-badge', getStatusClass(report.status)]">
                  {{ getStatusLabel(report.status) }}
                </span>
              </div>
              <h4 class="report-title">{{ report.titre || 'Sans titre' }}</h4>
              <div class="report-meta">
                <span class="report-date">
                  <ion-icon name="calendar-outline"></ion-icon>
                  {{ formatDate(report.date) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import { apiService } from './services/api.js';
import { auth } from './firebase.js';

const router = useRouter();
const loading = ref(true);
const reports = ref([]);
const currentUser = ref(null);
const notificationCount = ref(0);
let unsubscribe = null;
let authUnsubscribe = null;

const userName = computed(() => {
  if (currentUser.value) {
    return currentUser.value.displayName || currentUser.value.email?.split('@')[0] || 'Utilisateur';
  }
  return 'Utilisateur';
});

const myReportsCount = computed(() => {
  return reports.value.length;
});

const resolvedCount = computed(() => {
  return reports.value.filter(r => r.status === 'termine').length;
});

const pendingCount = computed(() => {
  return reports.value.filter(r => r.status === 'en cours').length;
});

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const recentReports = computed(() => {
  if (!currentUser.value) return [];
  return reports.value
    .filter(r => r.userId === currentUser.value.uid)
    .sort((a, b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0)
    .slice(0, 5);
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
  }
};

const getStatusLabel = (status) => {
  switch(status) {
    case 'termine': return 'Terminé';
    case 'en cours': return 'En cours';
    case 'nouveau': return 'Nouveau';
    default: return status || 'Nouveau';
  }
};

const goToMap = (action) => {
  if (action === 'new') {
    router.push({ name: 'Map', query: { action: 'new' } });
  } else {
    router.push({ name: 'Map' });
  }
};

const goBack = () => {
  router.go(-1);
};

const goToHome = () => {
  // Already on home, maybe refresh data
  console.log('Current page: Home');
};

const goToMyReports = () => router.push({ name: 'MyReports' });
const goToNotifications = () => router.push({ name: 'Notifications' });
const goToProfile = () => console.log('Profile');
const viewReport = (report) => router.push({ name: 'Map', query: { reportId: report.id } });

onMounted(() => {
  authUnsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser.value = user;
    } else {
      currentUser.value = null;
      router.push({ name: 'Login' });
    }
  });

  unsubscribe = apiService.subscribeToSignalements((items) => {
    reports.value = items;
    loading.value = false;
  });
  
  // Simuler le comptage des notifications
  notificationCount.value = 3;
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe();
  if (authUnsubscribe) authUnsubscribe();
});
</script>

<style scoped>
.home-content {
  --background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
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

.notification-button {
  position: relative;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.notification-button ion-icon {
  font-size: 22px;
  color: white;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
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

.user-avatar ion-icon {
  font-size: 20px;
  color: white;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  padding: 48px 24px;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px 0;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 400;
}

/* Dashboard Container */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card.reports::before {
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card.resolved::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stat-card.pending::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.priority::before {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-icon {
  font-size: 24px;
  color: #64748b;
}

.stat-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 14px;
  color: #10b981;
  font-weight: 500;
}

.stat-trend.urgent {
  color: #ef4444;
}

/* Actions Section */
.actions-section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 32px 0;
  letter-spacing: -0.5px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  text-align: left;
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.action-btn.primary::before {
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
}

.action-btn.secondary::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.action-btn.tertiary::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.action-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn.primary .action-icon-wrapper {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
}

.action-btn.secondary .action-icon-wrapper {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.action-btn.tertiary .action-icon-wrapper {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.action-icon-wrapper ion-icon {
  font-size: 32px;
}

.action-content h4 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.action-content p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Reports Section */
.reports-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.view-all-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 32px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-container ion-spinner {
  color: #3b82f6;
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

.loading-container p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.empty-container {
  background: white;
  border-radius: 20px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-illustration {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.empty-illustration ion-icon {
  font-size: 40px;
  color: #94a3b8;
}

.empty-container h3 {
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.empty-container p {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.create-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.report-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #cbd5e1;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.report-type {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.report-type ion-icon {
  font-size: 16px;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-nouveau {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-en-cours {
  background: #fef3c7;
  color: #d97706;
}

.status-termine {
  background: #d1fae5;
  color: #059669;
}

.status-default {
  background: #f1f5f9;
  color: #64748b;
}

.report-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.report-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.report-date ion-icon {
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    padding: 12px 16px;
    flex-direction: column;
    gap: 16px;
  }
  
  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 16px;
  }
  
  .nav-link {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .header-actions {
    order: 2;
    gap: 12px;
  }
  
  .user-info {
    display: none;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .dashboard-container {
    padding: 24px 16px;
  }
  
  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-btn {
    padding: 24px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .action-content h4 {
    font-size: 18px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 8px 12px;
  }
  
  .logo-section .app-name {
    font-size: 20px;
  }
  
  .hero-section {
    padding: 32px 16px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>