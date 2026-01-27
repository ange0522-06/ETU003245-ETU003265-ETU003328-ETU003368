<template>
  <div class="recap-table">
    <h3>Récapitulatif des travaux</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Status</th>
            <th>Date</th>
            <th>Surface (m²)</th>
            <th>Budget (Ar)</th>
            <th>Entreprise</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="point in paginatedPoints" :key="point.id">
            <td>{{ point.titre || 'Travaux routier' }}</td>
            <td>
              <span :class="getStatusClass(point.status)">{{ point.status }}</span>
            </td>
            <td>{{ point.date || '-' }}</td>
            <td>{{ point.surface || '-' }}</td>
            <td>{{ point.budget || '-' }}</td>
            <td>{{ point.entreprise || '-' }}</td>
          </tr>
        </tbody>
      </table>
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

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<style scoped>
.recap-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.recap-table h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead {
  background: #f8f9fa;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  font-weight: 600;
  color: #2c3e50;
}

tbody tr:hover {
  background: #f8f9fa;
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
