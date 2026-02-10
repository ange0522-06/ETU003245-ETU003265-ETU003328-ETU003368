<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Left side - Form similar to web design -->
        <div class="form-section">
          <div class="form-wrapper">
            <h1 class="welcome-title">Welcome back 👋</h1>
            <p class="subtitle">Please enter your details.</p>

            <form @submit.prevent="login" class="login-form">
              <div class="input-group">
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  class="custom-input"
                ></ion-input>
              </div>

              <div class="input-group">
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Mot de passe"
                  required
                  class="custom-input"
                ></ion-input>
              </div>

              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox" />
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" class="forgot-password">Forgot password?</a>
              </div>

              <ion-button
                expand="block"
                type="submit"
                class="login-button"
                :disabled="loading"
              >
                {{ loading ? 'Connexion...' : 'Log in' }}
              </ion-button>

              <ion-text color="danger" v-if="error" class="error-text">
                {{ error }}
              </ion-text>

              <!-- Sign Up Link -->
              <div class="signup-text">
                Don't have an account? <a href="#" class="signup-link">Sign up</a>
              </div>
            </form>
          </div>
        </div>

        <!-- Right side - Branding panel like web -->
        <div class="brand-section">
          <div class="brand-wrapper">
            <h2 class="brand-title">LALANA</h2>

            <div class="logo-box">
              <!-- reuse existing SVG as logo inside white square -->
              <div class="logo-inner">
                <img :src="roadLogo" alt="Road Logo" class="logo-img" />
              </div>
            </div>

            <p class="brand-sub">Plateforme de suivi des travaux routiers</p>


          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from './services/authService.js';
import { IonPage, IonContent, IonInput, IonButton, IonText } from '@ionic/vue';
import roadLogo from '../../react/webapp/src/assets/1.jpg';

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const router = useRouter();

const login = async () => {
  error.value = '';
  loading.value = true;
  
  try {
    const result = await authService.login(email.value, password.value);
    
    if (result.success) {
      // Vérifier que l'utilisateur peut accéder à l'app mobile
      if (authService.canAccessMobileApp()) {
        console.log('✅ Connexion réussie, rôle:', result.user.role);
        router.push({ name: 'Home' });
      } else {
        error.value = 'Votre compte n\'est pas autorisé à accéder à l\'application mobile';
        await authService.logout();
      }
    } else {
      error.value = result.error || 'Email ou mot de passe incorrect';
    }
  } catch (e) {
    console.error('Erreur lors de la connexion:', e);
    error.value = 'Erreur de connexion au serveur';
  } finally {
    loading.value = false;
  }
};


</script>

<style scoped>
.login-content {
  --background: #f3f6f9;
  padding: 32px;
}

.login-container {
  display: flex;
  height: 600px;
  max-width: 1000px;
  margin: 50px auto;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(6, 20, 34, 0.12);
}

.form-section {
  flex: 0 0 45%;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.form-wrapper {
  width: 100%;
  max-width: 360px;
}

.welcome-title {
  font-size: 30px;
  font-weight: 800;
  color: #0f2430;
  margin: 6px 0 10px 0;
}

.subtitle {
  font-size: 13px;
  color: #9aa9b6;
  margin: 0 0 28px 0;
}

.login-form { display:flex; flex-direction:column; gap:14px }
.custom-input { --background:#f6fbff; --padding-start:14px; border:1px solid #e9f0f6; border-radius:8px; height:46px }
.custom-input:focus-within { border-color:#2196F3 }

.form-options { display:flex; justify-content:space-between; align-items:center; font-size:13px }
.forgot-password { color:#2196F3; text-decoration:none }

.login-button { --background:#2196F3; --border-radius:10px; height:46px; font-weight:700; box-shadow:0 6px 18px rgba(33,150,243,0.18) }
.error-text { margin-top:8px }

.brand-section { flex: 0 0 55%; background: linear-gradient(180deg,#2196F3 0%,#1976D2 60%); display:flex; align-items:center; justify-content:center }
.brand-wrapper { text-align:center; color:#fff; max-width:420px; padding:40px }

.brand-title { font-size:44px; letter-spacing:6px; margin:0 0 24px 0; font-weight:900 }
.logo-box { display:flex; align-items:center; justify-content:center }
.logo-inner { width:240px; height:240px; background:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:0 12px 40px rgba(2,12,28,0.3) }
.logo-svg { width:160px; height:160px }
.logo-img { width:160px; height:160px; object-fit:contain; display:block }
.brand-sub { color:rgba(255,255,255,0.85); font-size:13px; margin-top:18px }

.signup-text { text-align:center; font-size:13px; color:#718096; margin:16px 0 0 0 }
.signup-link { color:#2196F3; text-decoration:none; font-weight:600 }
.signup-link:hover { text-decoration:underline }

/* Responsive -> stack columns on small screens, keep branding visible */
@media (max-width: 768px) {
  .login-container { flex-direction:column; border-radius:0; height:auto; min-height:100vh }
  .brand-section { order:-1; padding:28px }
  .brand-wrapper { padding:12px }
  .brand-title { font-size:28px }
}
</style>
