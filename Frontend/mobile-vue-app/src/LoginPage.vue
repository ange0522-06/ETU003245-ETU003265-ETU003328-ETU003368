<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Left side - Form -->
        <div class="form-section">
          <div class="form-wrapper">
            <h1 class="welcome-title">Bienvenue 👋</h1>
            <p class="subtitle">Veuillez entrer vos identifiants</p>

            <form @submit.prevent="login" class="login-form">
              <!-- Email Input -->
              <div class="input-group">
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Email"
                  required
                  class="custom-input"
                ></ion-input>
              </div>

              <!-- Password Input -->
              <div class="input-group">
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Mot de passe"
                  required
                  class="custom-input"
                ></ion-input>
              </div>

              <!-- Remember & Forgot -->
              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox" />
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#" class="forgot-password">Mot de passe oublié?</a>
              </div>

              <!-- Login Button -->
              <ion-button
                expand="block"
                type="submit"
                class="login-button"
                :disabled="loading"
              >
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </ion-button>

              <!-- Error Message -->
              <ion-text color="danger" v-if="error" class="error-text">
                {{ error }}
              </ion-text>

              <!-- Sign Up Link -->
          
            </form>
          </div>
        </div>

        <!-- Right side - Image -->
        <div class="image-section">
          <div class="image-wrapper">
            <svg viewBox="0 0 400 500" class="road-illustration">
              <!-- Sky gradient -->
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#FFD93D;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#FF9F40;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:1" />
                </linearGradient>
                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#4A5568;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#2D3748;stop-opacity:1" />
                </linearGradient>
              </defs>
              
              <!-- Sky -->
              <rect width="400" height="300" fill="url(#skyGradient)"/>
              
              <!-- Sun -->
              <circle cx="320" cy="80" r="50" fill="#FFE66D" opacity="0.8"/>
              
              <!-- Mountains background -->
              <path d="M0,200 Q100,150 200,180 T400,160 L400,300 L0,300 Z" fill="#8B7355" opacity="0.6"/>
              <path d="M0,220 Q150,170 250,200 T400,190 L400,300 L0,300 Z" fill="#A0826D" opacity="0.7"/>
              
              <!-- Hills -->
              <ellipse cx="100" cy="280" rx="120" ry="60" fill="#7CB342"/>
              <ellipse cx="300" cy="290" rx="140" ry="70" fill="#8BC34A"/>
              <ellipse cx="200" cy="300" rx="100" ry="50" fill="#9CCC65"/>
              
              <!-- Road -->
              <path d="M160,500 Q180,400 190,300 L210,300 Q220,400 240,500 Z" fill="url(#roadGradient)"/>
              
              <!-- Road lines -->
              <rect x="195" y="310" width="10" height="30" fill="#FFF" opacity="0.8"/>
              <rect x="195" y="360" width="10" height="30" fill="#FFF" opacity="0.8"/>
              <rect x="195" y="410" width="10" height="30" fill="#FFF" opacity="0.8"/>
              <rect x="195" y="460" width="10" height="30" fill="#FFF" opacity="0.8"/>
              
              <!-- Trees -->
              <g transform="translate(80, 320)">
                <rect x="-5" y="0" width="10" height="40" fill="#6D4C41"/>
                <circle cx="0" cy="-10" r="25" fill="#2E7D32"/>
              </g>
              <g transform="translate(320, 330)">
                <rect x="-5" y="0" width="10" height="35" fill="#6D4C41"/>
                <circle cx="0" cy="-8" r="22" fill="#388E3C"/>
              </g>
              <g transform="translate(140, 360)">
                <rect x="-4" y="0" width="8" height="30" fill="#6D4C41"/>
                <circle cx="0" cy="-6" r="18" fill="#43A047"/>
              </g>
              
              <!-- Road signs -->
              <g transform="translate(130, 380)">
                <rect x="-2" y="0" width="4" height="50" fill="#757575"/>
                <polygon points="-15,-20 15,-20 0,-40" fill="#FFC107" stroke="#333" stroke-width="2"/>
                <text x="0" y="-25" text-anchor="middle" font-size="20" fill="#333">⚠</text>
              </g>
              
              <!-- Car -->
              <g transform="translate(200, 440)">
                <rect x="-20" y="-10" width="40" height="20" rx="3" fill="#2196F3"/>
                <rect x="-15" y="-18" width="30" height="10" rx="2" fill="#64B5F6"/>
                <circle cx="-12" cy="10" r="5" fill="#333"/>
                <circle cx="12" cy="10" r="5" fill="#333"/>
                <rect x="-8" y="-16" width="6" height="8" fill="#E3F2FD" opacity="0.7"/>
                <rect x="2" y="-16" width="6" height="8" fill="#E3F2FD" opacity="0.7"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { IonPage, IonContent, IonInput, IonButton, IonText } from '@ionic/vue';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();

const login = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push({ name: 'Map' });
      }
    });
  } catch (e) {
    error.value = 'Email ou mot de passe incorrect';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-content {
  --background: #1a2e1a;
}

.login-container {
  display: flex;
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0 0 32px 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
}

.custom-input {
  --background: #f7fafc;
  --padding-start: 16px;
  --padding-end: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  height: 50px;
  font-size: 14px;
}

.custom-input:focus-within {
  --background: white;
  border-color: #ff9f40;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin: -4px 0 8px 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4a5568;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  cursor: pointer;
}

.forgot-password {
  color: #ff9f40;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  --background: #ff9f40;
  --background-hover: #ff8c1a;
  --background-activated: #ff8c1a;
  --border-radius: 12px;
  height: 50px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 8px;
  text-transform: none;
  letter-spacing: 0.3px;
}

.error-text {
  text-align: center;
  font-size: 13px;
  margin-top: 8px;
  display: block;
}

.signup-text {
  text-align: center;
  font-size: 13px;
  color: #718096;
  margin: 16px 0 0 0;
}

.signup-link {
  color: #ff9f40;
  text-decoration: none;
  font-weight: 600;
}

.signup-link:hover {
  text-decoration: underline;
}

.image-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.road-illustration {
  width: 100%;
  height: auto;
  display: block;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    border-radius: 0;
    height: auto;
    min-height: 100vh;
  }

  .image-section {
    order: -1;
    min-height: 300px;
    padding: 20px;
  }

  .form-section {
    padding: 30px 20px;
  }

  .form-wrapper {
    max-width: 100%;
  }

  .welcome-title {
    font-size: 28px;
  }

  .image-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>