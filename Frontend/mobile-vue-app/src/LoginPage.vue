<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="login">
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input v-model="email" type="email" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Mot de passe</ion-label>
          <ion-input v-model="password" type="password" required></ion-input>
        </ion-item>
        <ion-button expand="block" type="submit">Se connecter</ion-button>
        <ion-text color="danger" v-if="error">{{ error }}</ion-text>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText } from '@ionic/vue';

const email = ref('');
const password = ref('');
const error = ref('');

const router = useRouter();
const login = async () => {
  error.value = '';
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    // Wait for auth state to update
    onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push({ name: 'Map' });
      }
    });
  } catch (e) {
    error.value = 'Email ou mot de passe incorrect';
  }
};
</script>
