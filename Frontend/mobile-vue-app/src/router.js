import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './LoginPage.vue';
import HomePage from './HomePage.vue';
import MapPage from './MapPage.vue';
import MyReportsPage from './MyReportsPage.vue';
import NotificationsPage from './NotificationsPage.vue';
import { authService } from './services/authService';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-reports',
    name: 'MyReports',
    component: MyReportsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: NotificationsPage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard pour protéger les pages
router.beforeEach((to, from, next) => {
  // Initialiser l'authentification si pas déjà fait
  authService.initializeAuth();
  
  const isAuthenticated = authService.isLoggedIn.value;
  const canAccessMobile = authService.canAccessMobileApp();
  
  console.log('🚯 Navigation vers:', to.name, '| Authé:', isAuthenticated, '| Mobile OK:', canAccessMobile);
  
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      console.log('🚫 Redirection vers login - pas connecté');
      next({ name: 'Login' });
    } else if (!canAccessMobile) {
      console.log('🚫 Redirection vers login - rôle non autorisé');
      next({ name: 'Login' });
    } else {
      next();
    }
  } else if (to.meta.requiresGuest) {
    if (isAuthenticated && canAccessMobile) {
      console.log('🏠 Utilisateur déjà connecté, redirection vers home');
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
