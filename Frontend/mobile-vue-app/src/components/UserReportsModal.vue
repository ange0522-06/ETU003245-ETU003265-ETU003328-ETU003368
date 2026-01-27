<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Mes signalements</h3>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <div class="modal-body">
        <div v-if="userReports.length === 0" class="no-reports">
          <p>Vous n'avez encore aucun signalement.</p>
        </div>

        <div v-else class="reports-list">
          <div
            v-for="report in userReports"
            :key="report.id"
            class="report-item"
            @click="selectReport(report)"
          >
            <div class="report-header">
              <h4>{{ report.titre || 'Signalement' }}</h4>
              <span :class="getStatusClass(report.status)">{{ report.status }}</span>
            </div>

            <div class="report-details">
              <div class="detail-row">
                <span class="label">Type:</span>
                <span>{{ report.type || 'Non spécifié' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span>{{ report.date || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Description:</span>
                <span>{{ report.description || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Urgence:</span>
                <span>{{ report.urgence || 'moyen' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedReport" class="report-full-details">
          <h4>Détails complets</h4>
          <div class="full-details-grid">
            <div class="detail-item">
              <label>Titre:</label>
              <span>{{ selectedReport.titre || 'Signalement' }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span :class="getStatusClass(selectedReport.status)">{{ selectedReport.status }}</span>
            </div>
            <div class="detail-item">
              <label>Type:</label>
              <span>{{ selectedReport.type || 'Non spécifié' }}</span>
            </div>
            <div class="detail-item">
              <label>Date:</label>
              <span>{{ selectedReport.date || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Description:</label>
              <span>{{ selectedReport.description || '-' }}</span>
            </div>
            <div class="detail-item">
              <label>Urgence:</label>
              <span>{{ selectedReport.urgence || 'moyen' }}</span>
            </div>
            <div class="detail-item">
              <label>Latitude:</label>
              <span>{{ selectedReport.latitude.toFixed(6) }}</span>
            </div>
            <div class="detail-item">
              <label>Longitude:</label>
              <span>{{ selectedReport.longitude.toFixed(6) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn-secondary">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  reports: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const userReports = computed(() => {
  return props.reports.filter(report => report.userId === props.currentUserId);
});

const selectedReport = ref(null);

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
  }
};

const selectReport = (report) => {
  selectedReport.value = report;
};

const closeModal = () => {
  selectedReport.value = null;
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #ecf0f1;
}

.modal-body {
  padding: 20px;
}

.no-reports {
  text-align: center;
  color: #7f8c8d;
  padding: 40px;
}

.reports-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.report-item {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-item:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.report-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.report-details .detail-row {
  display: flex;
  margin-bottom: 5px;
}

.report-details .label {
  font-weight: 600;
  color: #34495e;
  min-width: 80px;
}

.report-full-details {
  border-top: 2px solid #ecf0f1;
  padding-top: 20px;
}

.report-full-details h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.full-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: #34495e;
  font-size: 0.9rem;
}

.detail-item span {
  color: #2c3e50;
  font-size: 0.95rem;
}

.modal-footer {
  padding: 20px;
  border-top: 2px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid #95a5a6;
  background: white;
  color: #95a5a6;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #95a5a6;
  color: white;
}

.status-termine {
  color: #27ae60;
  font-weight: bold;
  background: #d5f4e6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-en-cours {
  color: #f39c12;
  font-weight: bold;
  background: #fdeaa7;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-nouveau {
  color: #3498db;
  font-weight: bold;
  background: #d6eaf8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-default {
  color: #95a5a6;
  font-weight: bold;
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .full-details-grid {
    grid-template-columns: 1fr;
  }

  .report-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .modal-footer {
    padding: 15px;
  }
}
</style>
