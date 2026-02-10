import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

import { createApp } from 'vue';
import App from './App.vue';
import { IonicVue } from '@ionic/vue';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';

import router from './router';

// 🔥 Initialiser Firebase Auth automatiquement
import { authService } from './services/authService.js';

// Initialiser l'authentification Firebase dès le démarrage
authService.initializeAuth();
console.log('🔥 Service d\'authentification Firebase initialisé');

const app = createApp(App);
app.use(IonicVue);
app.use(router);
app.component('LMap', LMap);
app.component('LTileLayer', LTileLayer);
app.component('LMarker', LMarker);
app.component('LPopup', LPopup);
app.mount('#app');
