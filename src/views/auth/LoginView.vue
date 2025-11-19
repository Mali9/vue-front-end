<template>
  <div class="auth">
    <div class="panel">
      <h2>Welcome back</h2>
      <p>Please sign in to manage the store.</p>

      <form @submit.prevent="handleSubmit">
        <label>
          Email
          <input v-model="form.email" type="email" class="input" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" class="input" required />
        </label>

        <button class="btn btn-primary" :disabled="auth.loading">
          {{ auth.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="link">
        Need an account?
        <RouterLink to="/register">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  await auth.login(form);
  router.push({ name: 'dashboard' });
};
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dbeafe, #ede9fe);
  padding: 1rem;
}

.panel {
  width: min(420px, 94vw);
  background: #fff;
  border-radius: 1.25rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 35px 70px -35px rgba(15, 23, 42, 0.4);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 500;
  color: #0f172a;
}

.link {
  text-align: center;
  color: #475569;
}

.link a {
  color: #2563eb;
  font-weight: 600;
}
</style>

