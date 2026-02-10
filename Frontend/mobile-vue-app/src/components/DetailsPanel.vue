<template>
  <div class="details-panel">
    <h3>Détails du point</h3>
    <div v-if="!point" class="no-selection">
      <p>Cliquez sur un point sur la carte pour voir les détails</p>
    </div>
    <div v-else class="point-details">
      <div class="detail-header">
        <h4>{{ point.titre || 'Travaux routier' }}</h4>
        <div class="header-actions">
          <span :class="getStatusClass(point.status)">{{ point.status }}</span>
        </div>
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
          <small class="field-note">Modifiable uniquement par le manager</small>
        </div>
        <div class="detail-item">
          <label>Budget :</label>
          <span>{{ point.budget || '-' }} Ar</span>
          <small class="field-note">Modifiable uniquement par le manager</small>
        </div>
        <div class="detail-item">
          <label>Entreprise :</label>
          <span>{{ point.entreprise || '-' }}</span>
          <small class="field-note">Modifiable uniquement par le manager</small>
        </div>
        <div class="detail-item full-width">
          <label>Description :</label>
          <span>{{ point.description || '-' }}</span>
        </div>
        <div class="detail-item full-width">
          <label>Type :</label>
          <span>{{ point.type || '-' }}</span>
        </div>        <div class="detail-item full-width">
          <label>Photos :</label>
          <div class="photos-display">
            <div v-if="point.photos && point.photos.length > 0" class="photos-list">
              <img v-for="(photo, index) in point.photos" :key="index" :src="photo" alt="Photo" class="photo-thumbnail" @click="openPhoto(photo)">
            </div>
            <span v-else>Aucune photo</span>
          </div>
        </div>      </div>

      <!-- Photos gallery -->
      <div v-if="point.photos && point.photos.length" class="photos-gallery">
        <h5>Photos</h5>
        <div class="photos-row">
          <div v-for="(p, i) in point.photos" :key="i" class="gallery-item">
            <img :src="p" @click="openPhoto(p)" class="gallery-thumb" alt="Photo signalement" />
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="shareLocation" class="btn-secondary">
          📤 Partager la position
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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

const openPhoto = (src) => {
  try {
    // open in a new tab / viewer
    window.open(src, '_blank');
  } catch (e) {
    console.warn('Cannot open photo', e);
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
  gap: 15px 25px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.detail-item span {
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.4;
}

.field-note {
  display: block;
  font-size: 11px;
  color: #999;
  font-style: italic;
  margin-top: 2px;
}

.photos-display {
  margin-top: 5px;
}

.photos-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.photo-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.photo-thumbnail:hover {
  opacity: 0.8;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

.photos-gallery {
  margin-top: 20px;
}

.photos-gallery h5 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1rem;
}

.photos-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gallery-item {
  cursor: pointer;
}

.gallery-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.gallery-thumb:hover {
  transform: scale(1.1);
}

.actions {
  margin-top: 25px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #7f8c8d, #6c7b7d);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-nouveau {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-en-cours {
  background: #fff3e0;
  color: #f57c00;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-termine {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-default {
  background: #f5f5f5;
  color: #666;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .photos-row {
    justify-content: center;
  }
}
</style>
