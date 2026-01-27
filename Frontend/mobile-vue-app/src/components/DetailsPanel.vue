<template>
  <div class="details-panel">
    <h3>Détails du point</h3>
    <div v-if="!point" class="no-selection">
      <p>Cliquez sur un point sur la carte pour voir les détails</p>
    </div>
    <div v-else class="point-details">
      <div class="detail-header">
        <h4>{{ point.titre || 'Travaux routier' }}</h4>
        <span :class="getStatusClass(point.status)">{{ point.status }}</span>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <label>Date :</label>
          <span>{{ point.date || '-' }}</span>
        </div>
        <div class="detail-item">
          <label>Latitude :</label>
          <span>{{ point.latitude.toFixed(6) }}</span>
        </div>
        <div class="detail-item">
          <label>Longitude :</label>
          <span>{{ point.longitude.toFixed(6) }}</span>
        </div>
        <div class="detail-item">
          <label>Surface :</label>
          <span>{{ point.surface || '-' }} m²</span>
        </div>
        <div class="detail-item">
          <label>Budget :</label>
          <span>{{ point.budget || '-' }} Ar</span>
        </div>
        <div class="detail-item">
          <label>Entreprise :</label>
          <span>{{ point.entreprise || '-' }}</span>
        </div>
      </div>

      <div class="actions">
        <button @click="viewOnMap" class="btn-primary">
          📍 Voir sur la carte
        </button>
        <button @click="shareLocation" class="btn-secondary">
          📤 Partager la position
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  point: {
    type: Object,
    default: null
  }
});

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
  }
};

const viewOnMap = () => {
  if (props.point) {
    // This would center the map on the selected point
    // Implementation depends on how the map component is structured
    console.log('View on map:', props.point);
  }
};

const shareLocation = () => {
  if (props.point && navigator.share) {
    navigator.share({
      title: props.point.titre || 'Point de travaux',
      text: `Position: ${props.point.latitude}, ${props.point.longitude}`,
      url: `https://www.openstreetmap.org/?mlat=${props.point.latitude}&mlon=${props.point.longitude}&zoom=15`
    });
  } else {
    // Fallback: copy to clipboard
    const text = `Position: ${props.point.latitude}, ${props.point.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Position copiée dans le presse-papiers');
    });
  }
};
</script>

<style scoped>
.details-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
}

.details-panel h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.no-selection {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
}

.point-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.detail-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.detail-grid {
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

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn-primary, .btn-secondary {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #d5dbdb;
}

.status-termine {
  color: #27ae60;
  font-weight: bold;
  background: #d5f4e6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.status-en-cours {
  color: #f39c12;
  font-weight: bold;
  background: #fdeaa7;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.status-nouveau {
  color: #3498db;
  font-weight: bold;
  background: #d6eaf8;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.status-default {
  color: #95a5a6;
  font-weight: bold;
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
