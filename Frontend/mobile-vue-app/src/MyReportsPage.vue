<template>
  <div class="my-reports-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="icon">📋</i> Mes signalements</h1>
          <p>Liste de vos signalements en temps réel — filtrez par statut</p>
        </div>
        <button class="btn-back" @click="goBack">← Retour</button>
      </div>

      <div class="controls">
        <div class="filter-group">
          <label class="filter-label">
            <span class="label-text">Filtrer par statut:</span>
            <select v-model="statusFilter" class="status-select">
              <option value="">🔍 Tous les statuts</option>
              <option value="nouveau">🆕 Nouveau</option>
              <option value="en cours">⏳ En cours</option>
              <option value="termine">✅ Terminé</option>
            </select>
          </label>
        </div>
        <div class="results-count">
          <span v-if="filteredReports.length > 0">
            {{ filteredReports.length }} signalement{{ filteredReports.length > 1 ? 's' : '' }} trouvé{{ filteredReports.length > 1 ? 's' : '' }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement de vos signalements...</p>
      </div>
      
      <div v-else-if="filteredReports.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Aucun signalement trouvé</h3>
        <p v-if="statusFilter">Essayez de changer le filtre de statut</p>
        <p v-else>Vous n'avez pas encore créé de signalement</p>
      </div>
      
      <div v-else class="reports-grid">
        <div v-for="r in filteredReports" :key="r.id" class="report-card">
          <div class="card-header">
            <div class="report-info">
              <h3 class="report-title">{{ r.titre || 'Signalement' }}</h3>
              <span class="report-date">{{ formatDate(r.date) }}</span>
            </div>
            <span :class="getStatusClass(r.status)">{{ r.status }}</span>
          </div>
          
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Type</span>
                <span class="info-value">{{ r.type || 'Non spécifié' }}</span>
              </div>
              <div class="info-item" v-if="r.description">
                <span class="info-label">Description</span>
                <span class="info-value">{{ r.description.substring(0, 60) }}{{ r.description.length > 60 ? '...' : '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from './services/api.js';
import { auth } from './firebase.js';

const router = useRouter();
const statusFilter = ref('');
const loading = ref(true);
const reports = ref([]);
const unsubscribe = ref(null);
const currentUser = ref(null);

const filteredReports = computed(() => {
  let list = reports.value.filter(r => r.userId === (currentUser.value ? currentUser.value.id : null));
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
  return list.sort((a,b) => (a.date && b.date) ? new Date(b.date) - new Date(a.date) : 0);
});

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
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

const goBack = () => router.push({ name: 'Map' });

onMounted(() => {
  // Auth
  const unsubscribeAuth = auth.onAuthStateChanged((u) => {
    if (u) currentUser.value = { id: u.uid, name: u.displayName || u.email };
    else currentUser.value = null;
  });

  // Real-time subscription
  unsubscribe.value = apiService.subscribeToSignalements((items) => {
    reports.value = items;
    loading.value = false;
  });

  // cleanup
  onBeforeUnmount(() => {
    if (typeof unsubscribe.value === 'function') unsubscribe.value();
    if (typeof unsubscribeAuth === 'function') unsubscribeAuth();
  });
});
</script>

<style scoped>
/* Base Layout */
.my-reports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header Section */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content p {
  margin: 0.5rem 0 0;
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

.icon {
  font-size: 1.5rem;
}

.btn-back {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

/* Controls Section */
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filter-group {
  flex: 1;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
  color: #374151;
}

.label-text {
  white-space: nowrap;
  font-size: 0.95rem;
}

.status-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.95rem;
  min-width: 200px;
  transition: all 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.results-count {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Loading and Empty States */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #374151;
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.report-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.report-info {
  margin-bottom: 0.75rem;
}

.report-title {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.report-date {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.card-body {
  padding: 1.25rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.4;
}

/* Status Badges */
.status-termine {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(22, 101, 52, 0.2);
}

.status-en-cours {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(146, 64, 14, 0.2);
}

.status-nouveau {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(30, 64, 175, 0.2);
}

.status-default {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #6b7280;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .my-reports-page {
    padding: 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .btn-back {
    align-self: flex-start;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  
  .filter-label {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .status-select {
    min-width: unset;
    width: 100%;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0;
  }
  
  .page-header {
    border-radius: 0;
    margin-bottom: 1rem;
  }
  
  .controls {
    border-radius: 0;
    margin-bottom: 1rem;
  }
  
  .reports-grid {
    gap: 0.75rem;
  }
  
  .report-card {
    border-radius: 12px;
  }
}
</style>
