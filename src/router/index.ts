import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppShell from '@/components/layout/AppShell.vue';

// Router configuration
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: AppShell,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardHome.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/dashboard/ProductsView.vue'),
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/dashboard/OrdersView.vue'),
        },
      ],
    },
  ],
});


// Route guards
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user) {
    await auth.fetchProfile();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;

