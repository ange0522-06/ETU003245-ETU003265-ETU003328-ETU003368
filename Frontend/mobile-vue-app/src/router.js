import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './LoginPage.vue';
import MapPage from './MapPage.vue';
import MyReportsPage from './MyReportsPage.vue';
import { auth } from './firebase';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage,
    meta: { requiresAuth: true }
  }
  ,{
    path: '/my-reports',
    name: 'MyReports',
    component: MyReportsPage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard pour protéger la page carte
router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  if (to.meta.requiresAuth && !user) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && user) {
    next({ name: 'Map' });
  } else {
    next();
  }
});

export default router;
