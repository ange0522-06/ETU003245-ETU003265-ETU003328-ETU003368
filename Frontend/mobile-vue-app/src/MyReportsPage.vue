<template>
  <ion-page>
    <ion-content :fullscreen="true" class="reports-content">
      <!-- Top Navigation -->
      <div class="top-navigation">
        <div class="nav-container">
          <div class="logo-section">
            <ion-icon name="car-sport" class="app-logo"></ion-icon>
            <span class="app-name">RoadSignal</span>
          </div>
          
          <nav class="nav-menu">
            <a href="#" class="nav-link" @click="goToHome">Accueil</a>
            <a href="#" class="nav-link active" @click="goToMyReports">Mes signalements</a>
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

      <!-- Main Content -->
      <div class="main-content">
        <!-- Filter -->
        <div class="filter-section">
          <select v-model="statusFilter" class="status-select">
            <option value="">Tous les statuts</option>
            <option value="nouveau">Nouveau</option>
            <option value="en cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          <span class="results-count" v-if="filteredReports.length > 0">
            {{ filteredReports.length }} signalement{{ filteredReports.length > 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Chargement...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredReports.length === 0" class="empty-state">
          <ion-icon name="document-text-outline" class="empty-icon"></ion-icon>
          <h3>Aucun signalement</h3>
          <p v-if="statusFilter">Aucun signalement avec ce statut</p>
          <p v-else>Vous n'avez pas encore créé de signalement</p>
          <button class="btn-new" @click="goToNewReport">Créer un signalement</button>
        </div>

        <!-- Reports List -->
        <div v-else class="reports-list">
          <div v-for="r in filteredReports" :key="r.id" class="signalement-card">
            <div class="card-header">
              <div class="status-icon">
                <span :class="getStatusIcon(r.status)">{{ getStatusIcon(r.status) }}</span>
              </div>
              <h4>{{ r.titre || 'Travaux routier' }}</h4>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgressWidth(r.status) + '%' }"></div>
            </div>
            <div class="card-description">
              <p>{{ getDetailedDescription(r) }}</p>
            </div>
            <div class="card-details">
              <div class="detail-item">
                <strong>Date:</strong> {{ formatDate(r.date) }}
              </div>
              <div class="detail-item">
                <strong>Type:</strong> {{ r.type || 'Non spécifié' }}
              </div>
              <div class="detail-item">
                <strong>Surface:</strong> {{ r.surface || '-' }} m²
              </div>
              <div class="detail-item">
                <strong>Budget:</strong> {{ r.budget || '-' }} Ar
              </div>
              <div class="detail-item">
                <strong>Entreprise:</strong> {{ r.entreprise || '-' }}
              </div>
            </div>
            <div class="card-buttons">
              <button class="btn-details" @click.stop="viewDetails(r)" title="Voir détails">
                👁️ Détails
              </button>
              <button class="btn-map" @click.stop="viewOnMap(r)" title="Voir sur la carte">
                🗺️ Carte
              </button>
            </div>
          </div>
        </div>

        <!-- Modal des détails -->
        <div v-if="selectedReport" class="modal-overlay" @click="closeDetails">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Détails du signalement</h3>
              <button @click="closeDetails" class="btn-close">✕</button>
            </div>
            <div class="modal-body">
              <DetailsPanel :point="selectedReport" @pointUpdated="onPointUpdated" />
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination" v-if="totalPages > 1">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            ‹ Précédent
          </button>

          <span class="pagination-info">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Suivant ›
          </button>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import { apiService } from './services/api.js';
import { auth } from './firebase.js';

import DetailsPanel from './components/DetailsPanel.vue';

const router = useRouter();
const statusFilter = ref('');
const loading = ref(true);
const error = ref(null);
const reports = ref([]);
let unsubscribe = null;
let authUnsubscribe = null;
const currentUser = ref(null);
const selectedReport = ref(null);
const notificationCount = ref(0);

const userName = computed(() => {
  if (currentUser.value) {
    return currentUser.value.name || currentUser.value.email?.split('@')[0] || 'Utilisateur';
  }
  return 'Utilisateur';
});

const currentPage = ref(1);
const itemsPerPage = 10;

// Timeout pour éviter le chargement infini
const loadingTimeout = ref(null);

const filteredReports = computed(() => {
  let list = reports.value;
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
  return list.sort((a,b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);
});

const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredReports.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredReports.value.length / itemsPerPage);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'termine': return '✅';
    case 'en cours': return '🔄';
    case 'nouveau': return '🆕';
    default: return '📋';
  }
};

const getProgressWidth = (status) => {
  switch(status) {
    case 'nouveau': return 25;
    case 'en cours': return 50;
    case 'termine': return 100;
    default: return 0;
  }
};

const getDetailedDescription = (report) => {
  if (report.description) return report.description;
  return `Signalement de type ${report.type || 'non spécifié'} - ${report.surface ? report.surface + ' m²' : 'Surface non définie'}`;
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

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const goToHome = () => router.push({ name: 'Home' });
const goToMyReports = () => {
  // Already on this page
  console.log('Already on MyReports page');
};
const goToMap = () => router.push({ name: 'Map' });
const goToNotifications = () => router.push({ name: 'Notifications' });
const goToProfile = () => console.log('Profile');
const goToNewReport = () => router.push({ name: 'Map', query: { action: 'new' } });
const viewOnMap = (report) => router.push({ name: 'Map', query: { reportId: report.id } });

const viewDetails = (report) => {
  console.log('Voir détails du signalement:', report.id);
  selectedReport.value = report;
};

const closeDetails = () => {
  selectedReport.value = null;
};

const onPointUpdated = (updatedPoint) => {
  // Find and update the report in the reports list
  const reportIndex = reports.value.findIndex(r => r.id === updatedPoint.id);
  if (reportIndex !== -1) {
    reports.value[reportIndex] = { ...reports.value[reportIndex], ...updatedPoint };
  }
  // Update the selected report as well
  if (selectedReport.value && selectedReport.value.id === updatedPoint.id) {
    selectedReport.value = { ...selectedReport.value, ...updatedPoint };
  }
};

const setupUserSubscription = (userId) => {
  // Nettoyer l'ancienne souscription
  if (typeof unsubscribe === 'function') {
    unsubscribe();
  }

  if (!userId) {
    console.warn('⚠️ Aucun utilisateur connecté');
    reports.value = [];
    loading.value = false;
    return;
  }

  console.log('👤 Configuration de la souscription pour utilisateur:', userId);
  loading.value = true;
  error.value = null;

  // Timeout de sécurité
  loadingTimeout.value = setTimeout(() => {
    if (loading.value) {
      console.warn('⏰ Timeout de chargement dépassé');
      loading.value = false;
      error.value = 'Chargement trop lent. Vérifiez votre connexion.';
    }
  }, 10000); // 10 secondes

  unsubscribe = apiService.subscribeToUserSignalements(
    userId,
    (items) => {
      console.log('📋 Signalements reçus:', items.length);
      reports.value = items;
      loading.value = false;
      error.value = null;
      if (loadingTimeout.value) {
        clearTimeout(loadingTimeout.value);
        loadingTimeout.value = null;
      }
    },
    (err) => {
      console.error('❌ Erreur lors de la récupération des signalements:', err);
      loading.value = false;
      error.value = 'Erreur de chargement. Réessayez plus tard.';
      if (loadingTimeout.value) {
        clearTimeout(loadingTimeout.value);
        loadingTimeout.value = null;
      }
    }
  );
};

onMounted(() => {
  authUnsubscribe = auth.onAuthStateChanged((u) => {
    if (u) {
      currentUser.value = { id: u.uid, name: u.displayName || u.email };
      setupUserSubscription(u.uid);
    } else {
      currentUser.value = null;
      reports.value = [];
      loading.value = false;
    }
  });
});

onBeforeUnmount(() => {
  if (typeof unsubscribe === 'function') unsubscribe();
  if (typeof authUnsubscribe === 'function') authUnsubscribe();
  if (loadingTimeout.value) {
    clearTimeout(loadingTimeout.value);
  }
});

// Réinitialiser la pagination quand le filtre change
watch(statusFilter, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.reports-content {
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

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: calc(16px + var(--ion-safe-area-top, 0px));
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.back-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-btn ion-icon {
  font-size: 24px;
  color: white;
}

.header-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

.main-content {
  padding: 16px;
  padding-bottom: 100px;
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.status-select {
  flex: 1;
  max-width: 200px;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  color: #333;
}

.results-count {
  font-size: 13px;
  color: #666;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #999;
}

.loading-state ion-spinner {
  color: #2563eb;
  width: 40px;
  height: 40px;
}

.loading-state p {
  margin-top: 16px;
  font-size: 14px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
}

.empty-state .empty-icon {
  font-size: 64px;
  color: #CCC;
}

.empty-state h3 {
  font-size: 18px;
  color: #333;
  margin: 16px 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  margin: 0 0 20px 0;
}

.btn-new {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.report-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.report-icon {
  width: 48px;
  height: 48px;
  background: #FFF0EB;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-icon ion-icon {
  font-size: 24px;
  color: #FF6B35;
}

.card-content {
  flex: 1;
  margin-bottom: 12px;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.report-meta {
  font-size: 13px;
  color: #999;
  margin: 0 0 6px 0;
}

.report-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.status-nouveau {
  background: #E3F2FD;
  color: #1976D2;
}

.status-en-cours {
  background: #FFF3E0;
  color: #F57C00;
}

.status-termine {
  background: #E8F5E9;
  color: #388E3C;
}

.status-default {
  background: #F5F5F5;
  color: #666;
}

.chevron {
  font-size: 18px;
  color: #CCC;
}

/* New card styles */
.signalement-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.signalement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.status-icon {
  font-size: 24px;
  margin-right: 10px;
}

.card-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.progress-bar {
  background: #ecf0f1;
  border-radius: 4px;
  height: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.progress-fill {
  background: #3498db;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.card-description {
  margin-bottom: 15px;
}

.card-description p {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
}

.card-details {
  margin-bottom: 15px;
}

.detail-item {
  margin-bottom: 5px;
  font-size: 14px;
}

.detail-item strong {
  color: #2c3e50;
}

.card-buttons {
  display: flex;
  gap: 8px;
}

.btn-details {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-details:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-details:active {
  transform: translateY(0);
}

.btn-map {
  background: #27ae60;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-map:hover {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-map:active {
  transform: translateY(0);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 0;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

/* Pagination styles */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 16px;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.pagination-btn:not(:disabled):hover {
  background: #f5f5f5;
  border-color: #2563eb;
}

.pagination-btn:disabled {
  background: #fafafa;
  color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* Tablet and larger */
@media (min-width: 768px) {
  .main-content {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
    padding-bottom: 120px;
  }

  .reports-list {
    gap: 16px;
  }

  .report-card {
    padding: 20px;
  }

  .modal-content {
    max-width: 800px;
  }
}
</style>
