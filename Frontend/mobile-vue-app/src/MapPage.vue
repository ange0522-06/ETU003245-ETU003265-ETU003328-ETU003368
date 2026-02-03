 <template>
  <div class="map-page">
    <div class="page-header">
      <h1 class="page-title">🗺️ Signalement des problèmes routiers</h1>
      <p class="page-subtitle">Cliquez sur la carte pour signaler un problème ou visualisez les signalements existants</p>
    </div>

    <div class="controls">
      <div class="control-buttons">
        <button
          :class="['btn', reportMode ? 'btn-active' : 'btn-secondary']"
          @click="toggleReportMode"
        >
          {{ reportMode ? '✋ Mode signalement actif' : '📍 Signaler un problème' }}
        </button>
        <button
          :class="['btn', filterMyReports ? 'btn-active' : 'btn-secondary']"
          @click="toggleFilter"
        >
          {{ filterMyReports ? '👥 Tous les signalements' : '👤 Mes signalements' }}
        </button>
      </div>
      <div v-if="reportMode" class="report-instructions">
        <p>📍 Cliquez sur la carte à l'emplacement du problème pour créer un signalement</p>
      </div>
    </div>

    <div style="display: flex; align-items: flex-start; gap: '20px'; flex-wrap: wrap;">
      <div class="content-container" style="flex: 1; min-height: 600px; padding: '20px'">
        <div v-if="loading" style="text-align: center; padding: '40px'; color: '#2c3e50'">
          Chargement des signalements...
        </div>
        <div v-if="error" style="color: red; text-align: center">{{ error }}</div>
        <div v-if="!loading && !error" style="height: 600px; width: 100%; border-radius: '12px'">
          <l-map
            ref="mapRef"
            style="height: 100%; width: 100%; border-radius: 12px; cursor: pointer;"
            :zoom="13"
            :center="position"
            @click="handleMapClick"
          >
            <l-tile-layer :url="url" :attribution="attribution" />
            <l-marker
              v-for="point in filteredPoints"
              :key="point.id"
              :lat-lng="[point.latitude, point.longitude]"
              :icon="createCustomIcon(getStatusColor(point.status))"
              @click="selectPoint(point)"
              @mouseover="openPopup"
              @mouseout="closePopup"
            >
              <l-popup>
                <div style="padding: '10px'">
                  <strong style="font-size: '16px'">{{ point.titre || 'Problème routier' }}</strong><br/>
                  <span>Status : <b :style="{color: getStatusColor(point.status)}">{{ point.status }}</b></span><br/>
                  <span>Type : {{ point.type || 'Non spécifié' }}</span><br/>
                  <span>Description : {{ point.description || '-' }}</span><br/>
                  <span>Date : {{ point.date || '-' }} </span><br/>
                  <span v-if="point.userId">Signalé par : {{ point.userName || 'Utilisateur' }}</span>
                </div>
              </l-popup>
            </l-marker>
          </l-map>
        </div>
      </div>

      <div class="content-container" style="width: '350px'; min-height: 600px; padding: '20px'">
        <DetailsPanel :point="selectedPoint" @delete-point="deletePoint" />
      </div>
    </div>

    <div style="margin-top: '30px'">
      <RecapTable :points="filteredPoints" />
    </div>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="modal-overlay" @click="closeReportModal">
      <div class="modal-content" @click.stop>
        <h3>Signaler un problème routier</h3>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label for="reportType">Type de problème *</label>
            <select id="reportType" v-model="newReport.type" required>
              <option value="">Sélectionnez un type</option>
              <option value="nid-de-poule">Nid de poule</option>
              <option value="fissure">Fissure/route abîmée</option>
              <option value="eclairage">Éclairage défectueux</option>
              <option value="signalisation">Signalisation manquante</option>
              <option value="drainage">Problème de drainage</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reportTitle">Titre du signalement *</label>
            <input
              id="reportTitle"
              type="text"
              v-model="newReport.titre"
              placeholder="Ex: Nid de poule dangereux"
              required
            />
          </div>

          <div class="form-group">
            <label for="reportDescription">Description *</label>
            <textarea
              id="reportDescription"
              v-model="newReport.description"
              placeholder="Décrivez le problème en détail..."
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="reportUrgency">Niveau d'urgence</label>
            <select id="reportUrgency" v-model="newReport.urgence">
              <option value="faible">Faible</option>
              <option value="moyen">Moyen</option>
              <option value="eleve">Élevé</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div class="coordinates-display">
            <small>📍 Position: {{ newReport.latitude.toFixed(6) }}, {{ newReport.longitude.toFixed(6) }}</small>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeReportModal">Annuler</button>
            <button type="submit" class="btn-primary" :disabled="submittingReport">
              {{ submittingReport ? 'Envoi...' : '📤 Signaler' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Reports Modal -->
    <UserReportsModal
      :show="showUserReportsModal"
      :reports="points"
      :current-user-id="currentUser.id"
      @close="closeUserReportsModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService } from './services/api.js';
import DetailsPanel from './components/DetailsPanel.vue';
import RecapTable from './components/RecapTable.vue';
import UserReportsModal from './components/UserReportsModal.vue';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const position = ref([-18.8792, 47.5079]);
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '© OpenStreetMap contributors';

const points = ref([]);
const loading = ref(true);
const error = ref('');
const selectedPoint = ref(null);

// New reactive variables for reporting functionality
const reportMode = ref(false);
const filterMyReports = ref(false);
const showReportModal = ref(false);
const submittingReport = ref(false);
const newReport = ref({
  latitude: 0,
  longitude: 0,
  type: '',
  titre: '',
  description: '',
  urgence: 'moyen'
});

// Mock current user (replace with actual auth later)
const currentUser = ref({
  id: 'user123',
  name: 'Utilisateur Test'
});

const filteredPoints = computed(() => {
  if (filterMyReports.value) {
    return points.value.filter(point => point.userId === currentUser.value.id);
  }
  return points.value;
});

const getStatusColor = (status) => {
  switch(status) {
    case 'termine': return '#4caf50';
    case 'en cours': return '#ffc107';
    case 'nouveau': return '#2196f3';
    default: return '#9e9e9e';
  }
};

const createCustomIcon = (color) => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background: ${color};
          border-radius: 50%;
          opacity: 0.8;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          top: 10px;
          left: 10px;
        "></div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const selectPoint = (point) => {
  selectedPoint.value = point;
};

const openPopup = (e) => {
  e.target.openPopup();
};

const closePopup = (e) => {
  e.target.closePopup();
};

const toggleReportMode = () => {
  reportMode.value = !reportMode.value;
  if (!reportMode.value) {
    closeReportModal();
  }
};

const toggleFilter = () => {
  showUserReportsModal.value = true;
};

const closeUserReportsModal = () => {
  showUserReportsModal.value = false;
};

const handleMapClick = (event) => {
  if (reportMode.value) {
    newReport.value.latitude = event.latlng.lat;
    newReport.value.longitude = event.latlng.lng;
    showReportModal.value = true;
  }
};

const closeReportModal = () => {
  showReportModal.value = false;
  newReport.value = {
    latitude: 0,
    longitude: 0,
    type: '',
    titre: '',
    description: '',
    urgence: 'moyen'
  };
};

const submitReport = async () => {
  if (!newReport.value.type || !newReport.value.titre || !newReport.value.description) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  submittingReport.value = true;

  try {
    const reportData = {
      ...newReport.value,
      status: 'nouveau',
      date: new Date().toISOString().split('T')[0],
      userId: currentUser.value.id,
      userName: currentUser.value.name
    };

    // Envoyer le signalement vers Firebase
    const savedReport = await apiService.addSignalementToFirebase(reportData);
    
    // Le signalement sera automatiquement ajouté via l'écoute temps réel
    console.log('✅ Signalement créé:', savedReport.id);

    closeReportModal();
    reportMode.value = false;

    // Show success message
    alert('Signalement envoyé avec succès ! Il sera visible par le Manager après synchronisation.');

  } catch (err) {
    console.error('Error submitting report:', err);
    alert('Erreur lors de l\'envoi du signalement');
  } finally {
    submittingReport.value = false;
  }
};

const deletePoint = async (pointId) => {
  try {
    // Supprimer de Firebase
    await apiService.deleteSignalementFromFirebase(String(pointId));
    
    // Le point sera automatiquement supprimé via l'écoute temps réel
    if (selectedPoint.value && selectedPoint.value.id === pointId) {
      selectedPoint.value = null;
    }
    console.log('✅ Signalement supprimé:', pointId);
  } catch (err) {
    console.error('Erreur suppression:', err);
    alert('Erreur lors de la suppression');
  }
};

// Variable pour stocker la fonction de désabonnement Firebase
let unsubscribeFirebase = null;

onMounted(async () => {
  try {
    // Écouter les signalements depuis Firebase en temps réel
    unsubscribeFirebase = apiService.subscribeToSignalements((signalements) => {
      points.value = signalements;
      loading.value = false;
      console.log('📍 Points mis à jour depuis Firebase:', signalements.length);
    });

    // Fallback: si pas de données Firebase après 5s, utiliser les données mock
    setTimeout(() => {
      if (loading.value && points.value.length === 0) {
        console.log('⚠️ Fallback vers données mock');
        points.value = apiService.getMockReports();
        loading.value = false;
      }
    }, 5000);

  } catch (err) {
    console.error('Erreur chargement Firebase:', err);
    error.value = 'Erreur lors du chargement des données Firebase';
    // Fallback vers données mock
    points.value = apiService.getMockReports();
    loading.value = false;
  }
});

// Nettoyage de l'abonnement Firebase quand le composant est détruit
onUnmounted(() => {
  if (unsubscribeFirebase) {
    unsubscribeFirebase();
    console.log('🔌 Désabonnement Firebase');
  }
});
</script>

<style scoped>
.map-page {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-active {
  background: #27ae60 !important;
  color: white;
}

.btn-active:hover {
  background: #229954 !important;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-secondary:hover {
  background: #d5dbdb;
}

.report-instructions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 10px;
}

.report-instructions p {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.content-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Modal Styles */
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
  padding: 25px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #34495e;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.coordinates-display {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .controls {
    padding: 15px;
  }

  .control-buttons {
    flex-direction: column;
  }

  .modal-content {
    padding: 20px;
    width: 95%;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
