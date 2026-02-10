 <template>
  <ion-page>
    <ion-content :fullscreen="true" class="map-content">
      <!-- Top Navigation -->
      <div class="top-navigation">
        <div class="nav-container">
          <div class="logo-section">
            <ion-icon name="car-sport" class="app-logo"></ion-icon>
            <span class="app-name">RoadSignal</span>
          </div>
          /\
          <nav class="nav-menu">
            <a href="#" class="nav-link" @click="goToHome">Accueil</a>
            <a href="#" class="nav-link" @click="goToMyReports">Mes signalements</a>
            <a href="#" class="nav-link active" @click="goToMap">Carte</a>
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

      <!-- Map Section -->
      <div class="map-wrapper">
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Chargement...</p>
        </div>
        <div v-if="error" class="error-state">{{ error }}</div>
        <div v-if="!loading && !error" class="map-container">
          <l-map
            ref="mapRef"
            style="height: 100%; width: 100%;"
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
              @mouseover="showTooltip(point, $event)"
              @mouseout="hideTooltip"
            >
              <l-popup>
                <div class="popup-content">
                  <strong>{{ point.titre || 'Problème routier' }}</strong><br/>
                  <span>Status: <b :style="{color: getStatusColor(point.status)}">{{ point.status }}</b></span><br/>
                  <span>Type: {{ point.type || 'Non spécifié' }}</span><br/>
                  <div v-if="point.photos && point.photos.length > 0" class="popup-photos">
                    <div class="photos-gallery">
                      <img 
                        v-for="(photo, index) in point.photos.slice(0, 3)"
                        :key="index"
                        :src="photo"
                        class="popup-photo"
                        @click="showPhotoModal(point.photos, index)"
                      />
                      <span v-if="point.photos.length > 3" class="more-photos">+{{ point.photos.length - 3}}</span>
                    </div>
                  </div>
                </div>
              </l-popup>
            </l-marker>
          </l-map>
        </div>
      </div>

      <!-- Report Mode Toggle -->
      <div class="report-toggle" v-if="!showReportModal">
        <button
          :class="['toggle-btn', { active: reportMode }]"
          @click="toggleReportMode"
        >
          <ion-icon :name="reportMode ? 'close' : 'add-circle'"></ion-icon>
          {{ reportMode ? 'Annuler' : 'Nouveau signalement' }}
        </button>
      </div>

      <div v-if="reportMode && !showReportModal" class="report-hint">
        <ion-icon name="location"></ion-icon>
        Touchez la carte pour signaler un problème
      </div>

      <!-- Selected Point Details -->
      <div v-if="selectedPoint && !showReportModal" class="selected-point-card">
        <div class="point-header">
          <h3>{{ selectedPoint.titre || 'Signalement' }}</h3>
          <span :class="['status-badge', getStatusClass(selectedPoint.status)]">
            {{ selectedPoint.status }}
          </span>
        </div>
        <div class="point-details">
          <p><strong>Type:</strong> {{ selectedPoint.type || 'Non spécifié' }}</p>
          <p><strong>Date:</strong> {{ selectedPoint.date || '-' }}</p>
          <p v-if="selectedPoint.description"><strong>Description:</strong> {{ selectedPoint.description }}</p>
          <div v-if="selectedPoint.photos && selectedPoint.photos.length > 0" class="point-photos">
            <p><strong>Photos:</strong></p>
            <div class="photos-grid">
              <img 
                v-for="(photo, index) in selectedPoint.photos.slice(0, 4)"
                :key="index"
                :src="photo"
                class="point-photo"
                @click="showPhotoModal(selectedPoint.photos, index)"
              />
              <div v-if="selectedPoint.photos.length > 4" class="more-photos-badge" @click="showPhotoModal(selectedPoint.photos, 0)">
                +{{ selectedPoint.photos.length - 4}} photos
              </div>
            </div>
          </div>
        </div>
        <button class="close-details" @click="selectedPoint = null">
          <ion-icon name="close"></ion-icon>
        </button>
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

          <div class="form-group">
            <label>Photos (optionnel)</label>
            <div class="photos-section">
              <div class="photo-actions">
                <button type="button" class="btn-photo" @click="addPhoto">
                  📷 Ajouter une photo
                </button>
                <input 
                  ref="photoInput" 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  @change="onFileSelected"
                  style="display: none"
                  multiple
                />
              </div>
              <div v-if="reportPhotos.length > 0" class="photos-grid">
                <div v-for="(photo, index) in reportPhotos" :key="index" class="photo-item">
                  <img :src="photo" alt="Photo signalement" class="photo-thumb" />
                  <button type="button" class="btn-remove-photo" @click="removePhoto(index)">×</button>
                </div>
              </div>
              <p class="photo-hint">Max 5 photos - {{ reportPhotos.length }}/5 • Images auto-compressées</p>
            </div>
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

    <!-- Tooltip pour survol -->
    <div v-if="hoveredPoint" class="map-tooltip" :style="tooltipStyle">
      <div class="tooltip-content">
        <h4>{{ hoveredPoint.titre }}</h4>
        <p><span class="status-indicator" :style="{backgroundColor: getStatusColor(hoveredPoint.status)}"></span>{{ hoveredPoint.status }}</p>
        <div v-if="hoveredPoint.photos && hoveredPoint.photos.length > 0" class="tooltip-photos">
          <div class="photo-preview">
            <img 
              v-for="(photo, index) in hoveredPoint.photos.slice(0, 2)"
              :key="index"
              :src="photo"
              class="tooltip-photo"
            />
            <div v-if="hoveredPoint.photos.length > 2" class="more-indicator">+{{ hoveredPoint.photos.length - 2}}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Photo Gallery -->
    <div v-if="showPhotoGallery" class="photo-modal-overlay" @click="closePhotoModal">
      <div class="photo-modal" @click.stop>
        <div class="photo-modal-header">
          <h3>Photos du signalement</h3>
          <button @click="closePhotoModal" class="btn-close-modal">
            <ion-icon name="close"></ion-icon>
          </button>
        </div>
        <div class="photo-modal-content">
          <div class="photo-main">
            <img :src="currentPhoto" class="main-photo" />
          </div>
          <div v-if="galleryPhotos.length > 1" class="photo-thumbnails">
            <img 
              v-for="(photo, index) in galleryPhotos"
              :key="index"
              :src="photo"
              :class="['thumb', { active: index === currentPhotoIndex }]"
              @click="currentPhotoIndex = index"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- User Reports Modal -->
    <UserReportsModal
      :show="showUserReportsModal"
      :reports="points"
      :current-user-id="currentUser ? currentUser.id : ''"
      @close="closeUserReportsModal"
    />

    <!-- Bottom Navigation -->
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonPage, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db, auth } from './firebase.js';
import { apiService } from './services/api.js';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import DetailsPanel from './components/DetailsPanel.vue';
import RecapTable from './components/RecapTable.vue';
import UserReportsModal from './components/UserReportsModal.vue';
import { notificationService } from './services/notificationService.js';

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
const showUserReportsModal = ref(false);
const showReportModal = ref(false);
const submittingReport = ref(false);
const reportPhotos = ref([]);
const photoInput = ref(null);
const newReport = ref({
  latitude: 0,
  longitude: 0,
  type: '',
  titre: '',
  description: '',
  urgence: 'moyen',
  photos: []
});

// Variables pour tooltip et galerie photos
const hoveredPoint = ref(null);
const tooltipStyle = ref({});
const showPhotoGallery = ref(false);
const galleryPhotos = ref([]);
const currentPhotoIndex = ref(0);
const currentPhoto = computed(() => galleryPhotos.value[currentPhotoIndex.value]);

// Utilisateur courant (lié à Firebase Auth)
const currentUser = ref(null);
const authDebug = ref({ uid: null, logged: false, lastError: null });
const notificationCount = ref(0);

const userName = computed(() => {
  if (currentUser.value) {
    return currentUser.value.name || currentUser.value.email?.split('@')[0] || 'Utilisateur';
  }
  return 'Utilisateur';
});

const filteredPoints = computed(() => points.value);

// Anchor for scrolling to the recap section
// recap anchor and scroll removed — recap is visible by default

const userReports = computed(() => {
  if (!currentUser.value) return [];
  return points.value.filter(point => point.userId === currentUser.value.id);
});

// filters removed — dedicated page/modal now handles user filtering

const getStatusColor = (status) => {
  switch(status) {
    case 'termine': return '#4caf50';
    case 'en cours': return '#ffc107';
    case 'nouveau': return '#2196f3';
    default: return '#9e9e9e';
  }
};

const getStatusClass = (status) => {
  switch(status) {
    case 'termine': return 'status-termine';
    case 'en cours': return 'status-en-cours';
    case 'nouveau': return 'status-nouveau';
    default: return 'status-default';
  }
};

const goToHome = () => {
  router.push({ name: 'Home' });
};

const goToMyReports = () => {
  router.push({ name: 'MyReports' });
};

const goToMap = () => {
  // Already on this page
  console.log('Already on Map page');
};

const goToNotifications = () => {
  router.push({ name: 'Notifications' });
};

const goToProfile = () => {
  console.log('Profile');
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
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
  
  // Scroll vers la section des détails (priorité: .details-container)
  const detailsSection = document.querySelector('.details-container') || document.querySelector('.content-container');
  if (detailsSection) {
    detailsSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
  
  // Petite notification visuelle
  console.log('📍 Détails affichés pour:', point.titre || 'Signalement');
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

// Photo compression function to avoid Firebase size limits
const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      console.log('🗜️ Image compressée:', {
        original: file.size ? Math.round(file.size / 1024) + 'KB' : 'N/A',
        compressed: Math.round(compressedDataUrl.length * 0.75 / 1024) + 'KB',
        dimensions: `${width}x${height}`
      });
      
      resolve(compressedDataUrl);
    };
    
    if (file instanceof File) {
      img.src = URL.createObjectURL(file);
    } else if (typeof file === 'string') {
      img.src = file;
    }
  });
};

// Photo management functions
const addPhoto = async () => {
  if (reportPhotos.value.length >= 5) {
    alert('Maximum 5 photos autorisées');
    return;
  }
  
  try {
    // Try Capacitor Camera first
    const mod = await import('@capacitor/camera');
    const { Camera, CameraResultType } = mod;
    const image = await Camera.getPhoto({
      quality: 60, // Reduced quality for smaller size
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: 'CAMERA'
    });
    
    if (image && image.dataUrl) {
      // Compress the image from camera
      const compressedImage = await compressImage(image.dataUrl);
      reportPhotos.value.push(compressedImage);
    }
  } catch (e) {
    // Fallback to file input
    console.log('📱 Camera not available, using file input');
    if (photoInput.value) {
      photoInput.value.click();
    }
  }
};

const onFileSelected = async (e) => {
  const files = Array.from(e.target.files || []);
  
  for (const file of files) {
    if (reportPhotos.value.length >= 5) break;
    
    try {
      // Compress each file before adding
      const compressedImage = await compressImage(file);
      reportPhotos.value.push(compressedImage);
    } catch (error) {
      console.error('❌ Erreur compression:', error);
      // Fallback: use original if compression fails, but warn user
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target.result;
        if (result.length > 500000) { // ~500KB limit warning
          alert('⚠️ Photo très volumineuse, elle pourrait causer des erreurs.');
        }
        reportPhotos.value.push(result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Reset input
  if (photoInput.value) photoInput.value.value = '';
};

const removePhoto = (index) => {
  reportPhotos.value.splice(index, 1);
};

const router = useRouter();
const openMyReports = () => {
  router.push({ name: 'MyReports' });
};

// Dropdown removed — use modal `showUserReportsModal` instead

const handleMapClick = (event) => {
  if (reportMode.value) {
    newReport.value.latitude = event.latlng.lat;
    newReport.value.longitude = event.latlng.lng;
    showReportModal.value = true;
  }
};

const closeReportModal = () => {
  showReportModal.value = false;
  reportPhotos.value = [];
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
    // Valider et filtrer les photos (limite de sécurité 400KB par photo)
    const validPhotos = reportPhotos.value.filter(photo => {
      if (!photo || typeof photo !== 'string' || !photo.startsWith('data:image/')) {
        return false;
      }
      // Estimation taille : base64 utilise ~4/3 de la taille originale
      const estimatedSize = photo.length * 0.75;
      if (estimatedSize > 400000) { // 400KB max par photo
        console.warn('⚠️ Photo trop volumineuse ignorée:', Math.round(estimatedSize / 1024) + 'KB');
        return false;
      }
      return true;
    });
    
    if (validPhotos.length !== reportPhotos.value.length) {
      alert(`⚠️ ${reportPhotos.value.length - validPhotos.length} photo(s) ignorée(s) (trop volumineuse)`);
    }
    
    console.log('📷 Photos valides:', validPhotos.length + '/' + reportPhotos.value.length);
    
    const reportData = {
      ...newReport.value,
      photos: validPhotos,
      status: 'nouveau',
      date: new Date().toISOString(),
      userId: currentUser.value ? currentUser.value.id : null,
      userName: currentUser.value ? (currentUser.value.name || currentUser.value.email) : 'Anonyme'
    };

    // Vérifier la taille totale du document
    const totalSize = JSON.stringify(reportData).length;
    console.log('📊 Taille totale document:', Math.round(totalSize / 1024) + 'KB');
    
    if (totalSize > 900000) { // 900KB max total document
      throw new Error('Document trop volumineux. Réduisez le nombre de photos.');
    }

    console.log('📤 Envoi signalement:', {
      ...reportData,
      photos: validPhotos.length + ' photos'
    });

    // Envoyer le signalement vers Firebase
    const savedReport = await apiService.addSignalementToFirebase(reportData);
    
    // Le signalement sera automatiquement ajouté via l'écoute temps réel
    console.log('✅ Signalement créé:', savedReport.id);

    // Le listener Firestore mettra à jour `points` automatiquement
    closeReportModal();
    reportMode.value = false;
    alert('Signalement envoyé avec succès ! (stocké dans Firestore → collection "signalements")');

    submittingReport.value = false;
  } catch (err) {
    console.error('Error submitting report:', err);
    alert('Erreur lors de l\'envoi du signalement: ' + err.message);
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

// Variables pour stocker les fonctions de désabonnement Firebase et Auth
let unsubscribeFirebase = null;
let authUnsubscribe = null;

onMounted(async () => {
  try {
    // Écouter les signalements depuis Firebase en temps réel
    unsubscribeFirebase = apiService.subscribeToSignalements((signalements) => {
      // Vérifier les changements de statut pour les notifications
      if (currentUser.value) {
        notificationService.checkForStatusChanges(signalements, currentUser.value.id);
        // Also refresh unread count from backend to reflect server-created notifications
        try { notificationService.refreshUnreadNotifications(currentUser.value.id); } catch(e){ console.warn('refreshUnreadNotifications failed', e); }
      }
      
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

  // Écoute de l'authentification Firebase
  authUnsubscribe = onAuthStateChanged(auth, (u) => {
    if (u) {
      currentUser.value = { id: u.uid, name: u.displayName || u.email, email: u.email };
      authDebug.value.uid = u.uid;
      authDebug.value.logged = true;
      authDebug.value.lastError = null;
      console.log('onAuthStateChanged: uid=', u.uid);
      // Load persisted notifications and refresh unread badge from server
      (async () => {
        try {
          await notificationService.loadUserNotifications(u.uid);
          await notificationService.refreshUnreadNotifications(u.uid);
        } catch (e) {
          console.warn('Failed to init notifications for user', e);
        }
      })();
    } else {
      currentUser.value = null;
      authDebug.value.uid = null;
      authDebug.value.logged = false;
      console.log('onAuthStateChanged: no user');
      // Clear notifications on sign-out
      try {
        const store = notificationService.getStore();
        store.notifications = [];
        store.unreadCount = 0;
      } catch (e) { /* ignore */ }
    }
  });
});

// Fonctions pour tooltip et galerie photos
const showTooltip = (point, event) => {
  hoveredPoint.value = point;
  const rect = event.target.getBoundingClientRect();
  tooltipStyle.value = {
    position: 'fixed',
    left: rect.left + 'px',
    top: (rect.top - 10) + 'px',
    zIndex: 10000,
    pointerEvents: 'none'
  };
};

const hideTooltip = () => {
  hoveredPoint.value = null;
};

const showPhotoModal = (photos, startIndex = 0) => {
  galleryPhotos.value = photos;
  currentPhotoIndex.value = startIndex;
  showPhotoGallery.value = true;
};

const closePhotoModal = () => {
  showPhotoGallery.value = false;
  galleryPhotos.value = [];
  currentPhotoIndex.value = 0;
};

onBeforeUnmount(() => {
  if (typeof unsubscribeFirebase === 'function') {
    try { unsubscribeFirebase(); } catch (e) { console.warn('Erreur lors du unsubscribeFirebase', e); }
  }
  if (typeof authUnsubscribe === 'function') {
    try { authUnsubscribe(); } catch (e) { console.warn('Erreur lors du authUnsubscribe', e); }
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

/* Mobile-first styles */
.map-content {
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

.map-wrapper {
  padding: 16px;
  padding-bottom: 200px;
}

.map-container {
  height: calc(100vh - 280px);
  min-height: 300px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
}

.loading-state ion-spinner {
  color: #FF6B35;
  width: 32px;
  height: 32px;
}

.report-toggle {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

.toggle-btn.active {
  background: #e74c3c;
}

.toggle-btn ion-icon {
  font-size: 20px;
}

.report-hint {
  position: fixed;
  bottom: 160px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff3cd;
  color: #856404;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 500;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.selected-point-card {
  position: fixed;
  bottom: 100px;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 400;
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.point-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
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

.point-details p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.point-details strong {
  color: #333;
}

.point-photos {
  margin-top: 12px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.point-photos .photos-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.point-photo {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s;
}

.point-photo:hover {
  transform: scale(1.05);
  border-color: #3b82f6;
}

.more-photos-badge {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.more-photos-badge:hover {
  background: #e5e7eb;
  color: #374151;
}

.close-details {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-details ion-icon {
  font-size: 16px;
  color: #666;
}

.popup-content {
  padding: 8px;
  font-size: 13px;
}

/* Legacy styles - keeping some for modal compatibility */
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 5px;
}

.no-reports {
  padding: 20px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.reports-list {
  max-height: 350px;
  overflow-y: auto;
}

.report-item {
  padding: 15px;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.report-item:hover {
  background: #f8f9fa;
}

.report-item:last-child {
  border-bottom: none;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.report-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
}

.report-details .detail-row {
  display: flex;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.report-details .label {
  font-weight: 600;
  color: #34495e;
  min-width: 60px;
  margin-right: 8px;
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

/* recap-dropdown removed: using page scroll to existing recap section */

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

.recap-section {
  background: transparent;
  padding-top: 8px;
}

/* Photo management styles */
.photos-section {
  margin-top: 16px;
}

.photo-actions {
  margin-bottom: 12px;
}

.btn-photo {
  background: #f0f8ff;
  color: #333;
  border: 2px dashed #4CAF50;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
  text-align: center;
}

.btn-photo:hover {
  background: #e8f5e8;
  border-color: #45a049;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin: 12px 0;
}

.photo-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.photo-thumb {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.btn-remove-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(255,0,0,0.8);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-remove-photo:hover {
  background: rgba(255,0,0,1);
}

.photo-hint {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
}

/* Responsive layout for map + details */
.map-and-details {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}
.map-container {
  flex: 1;
  min-height: 520px;
}
.details-container {
  width: 350px;
  min-height: 420px;
}

@media (max-width: 900px) {
  .map-and-details {
    flex-direction: column;
  }
  .details-container {
    width: 100%;
  }
  .map-container {
    min-height: 360px;
  }
}

/* Tooltip styles */
.map-tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  max-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateX(-50%) translateY(-100%);
}

.tooltip-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.tooltip-content p {
  margin: 0 0 8px 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-photos {
  margin-top: 8px;
}

.photo-preview {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tooltip-photo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.more-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: white;
}

/* Photo Modal styles */
.photo-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.photo-modal {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.photo-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.photo-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.btn-close-modal {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
}

.btn-close-modal:hover {
  background: #f3f4f6;
}

.photo-modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.photo-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.main-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.photo-thumbnails {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  overflow-x: auto;
}

.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  flex-shrink: 0;
}

.thumb:hover {
  opacity: 0.8;
}

.thumb.active {
  border-color: #3b82f6;
}

/* Popup styles */
.popup-content {
  font-family: 'Inter', sans-serif;
}

.popup-photos {
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
}

.photos-gallery {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.popup-photo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s;
}

.popup-photo:hover {
  transform: scale(1.1);
}

.more-photos {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

</style>
