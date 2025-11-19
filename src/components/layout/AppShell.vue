<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="dot"></span>
        <p>E-Commerce</p>
      </div>

      <Aside :links="links" />

      <button v-if="auth.user" class="logout" @click="handleLogout">Logout</button>
    </aside>

    <div class="content">
      <header class="topbar">
        <h1>{{ currentTitle }}</h1>
        <p v-if="auth.user" class="user">Hi, {{ auth.user.name }}</p>
      </header>

      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Aside from './Aside.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const links = [
  { name: 'dashboard', label: 'Dashboard', to: { name: 'dashboard' } },
  { name: 'products', label: 'Products', to: { name: 'products' } },
  { name: 'orders', label: 'Orders', to: { name: 'orders' } },
];

const currentTitle = computed(() => {
  const titles: Record<string, string> = {
    dashboard: 'Overview',
    products: 'Products',
    orders: 'Orders',
  };
  return titles[route.name as string] ?? 'Dashboard';
});

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: #f1f5f9;
}

.sidebar {
  background: #0f172a;
  color: #fff;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.brand .dot {
  width: 0.75rem;
  height: 0.75rem;
  background: #38bdf8;
  border-radius: 999px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.nav-link.active,
.nav-link:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #fff;
}

.logout {
  margin-top: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.6rem 1rem;
  color: #fff;
  transition: background 0.2s ease;
}

.logout:hover {
  background: rgba(148, 163, 184, 0.2);
}

.content {
  padding: 2rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.topbar h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
}

.user {
  color: #475569;
  font-weight: 500;
}

main {
  min-height: calc(100vh - 5rem);
}

@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  nav {
    flex-direction: row;
  }

  .content {
    padding: 1rem;
  }
}
</style>

