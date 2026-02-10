<template>
  <div class="recap-cards">
    <h3>Récapitulatif des travaux</h3>
    <p class="table-help" style="
      margin: 8px 0 16px 0;
      color: #7f8c8d;
      font-size: 14px;
      font-style: italic;
    ">
      💡 Cliquez sur "👁️ Détails" pour voir les informations complètes d'un signalement
    </p>
    <div class="cards-grid">
      <div v-for="point in paginatedPoints" :key="point.id" class="signalement-card">
        <div class="card-header">
          <div class="status-icon">
            <span :class="getStatusIcon(point.status)">{{ getStatusIcon(point.status) }}</span>
          </div>
          <h4>{{ point.titre || 'Travaux routier' }}</h4>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: getProgressWidth(point.status) + '%' }"></div>
        </div>
        <div class="card-description">
          <p>{{ getDetailedDescription(point) }}</p>
        </div>
        <div class="card-details">
          <div class="detail-item">
            <strong>Date:</strong> {{ point.date || '-' }}
          </div>
          <div class="detail-item">
            <strong>Surface:</strong> {{ point.surface || '-' }} m²
          </div>
          <div class="detail-item">
            <strong>Budget:</strong> {{ point.budget || '-' }} Ar
          </div>
          <div class="detail-item">
            <strong>Entreprise:</strong> {{ point.entreprise || '-' }}
          </div>
        </div>
        <button class="btn-details" @click="viewDetails(point)" :title="'Voir détails de: ' + (point.titre || 'ce signalement')">
          👁️ Détails
        </button>
        <button class="btn-map" @click="viewOnMap(point)" :title="'Voir sur la carte: ' + (point.titre || 'ce signalement')">
          🗺️ Carte
        </button>
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

    <div class="summary">
      <div class="summary-item">
        <strong>Total points:</strong> {{ points.length }}
      </div>
      <div class="summary-item">
        <strong>Budget total:</strong> {{ totalBudget }} Ar
      </div>
      <div class="summary-item">
        <strong>Surface totale:</strong> {{ totalSurface }} m²
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['view-details']);

// Function to emit details view event
const viewDetails = (point) => {
  emit('view-details', point);
};

// Function to emit map view event
const viewOnMap = (point) => {
  emit('view-on-map', point);
};

const currentPage = ref(1);
const itemsPerPage = 10;

const totalPages = computed(() => {
  return Math.ceil(props.points.length / itemsPerPage);
});

const paginatedPoints = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return props.points.slice(start, end);
});

const totalBudget = computed(() => {
  return props.points.reduce((sum, point) => sum + (point.budget || 0), 0);
});

const totalSurface = computed(() => {
  return props.points.reduce((sum, point) => sum + (point.surface || 0), 0);
});

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
  }
};

const getStatusIcon = (status) => {
  switch(status) {
    case 'termine': return '✅';
    case 'en cours': return '⏳';
    case 'nouveau': return '⭐';
    default: return '❓';
  }
};

const getProgressWidth = (status) => {
  switch(status) {
    case 'termine': return 100;
    case 'en cours': return 50;
    case 'nouveau': return 0;
    default: return 0;
  }
};

const getDetailedDescription = (point) => {
  return `Signalement pour ${point.titre || 'travaux routiers'} - Surface: ${point.surface || 'N/A'} m², Budget: ${point.budget || 'N/A'} Ar, Entreprise: ${point.entreprise || 'N/A'}`;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
.recap-cards {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.recap-cards h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.signalement-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.summary {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 20px;
  border-top: 2px solid #ecf0f1;
}

.summary-item {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  min-width: 120px;
}

.summary-item strong {
  color: #2c3e50;
  display: block;
  margin-bottom: 5px;
}

.status-termine {
  color: #27ae60;
  font-weight: bold;
}

.status-en-attente {
  color: #e67e22;
  font-weight: bold;
}

.status-en-cours {
  color: #f39c12;
  font-weight: bold;
}

.status-nouveau {
  color: #3498db;
  font-weight: bold;
}

.status-default {
  color: #95a5a6;
  font-weight: bold;
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
  margin-left: 8px;
}

.btn-map:hover {
  background: #229954;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.btn-map:active {
  transform: translateY(0);
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #bdc3c7;
  color: #bdc3c7;
}

.pagination-info {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .summary {
    flex-direction: column;
    align-items: center;
  }

  table {
    font-size: 0.8rem;
  }

  th, td {
    padding: 8px;
  }
}
</style>
