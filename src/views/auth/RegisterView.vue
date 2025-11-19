<template>
  <div class="auth">
    <div class="panel">
      <h2>Create account</h2>
      <p>Join the dashboard in a few seconds.</p>

      <form @submit.prevent="handleSubmit">
        <label>
          Name
          <input v-model="form.name" type="text" class="input" required />
        </label>

        <label>
          Email
          <input v-model="form.email" type="email" class="input" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" class="input" required />
        </label>

        <button class="btn btn-primary" :disabled="auth.loading">
          {{ auth.loading ? 'Creating...' : 'Create account' }}
        </button>
      </form>

      <p class="link">
        Already registered?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';
import { getErrorMessage } from '@/utils/errorHandler';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  name: '',
  email: '',
  password: '',
});

const handleSubmit = async () => {
  try {
    await auth.register(form);
    await Swal.fire({
      icon: 'success',
      title: 'Account Created!',
      text: 'Your account has been created successfully. Welcome!',
      timer: 1500,
      showConfirmButton: false,
    });
    router.push({ name: 'dashboard' });
  } catch (error) {
    const errorMessage = auth.error || getErrorMessage(error) || 'Unable to register. Please try again.';
    await Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: errorMessage,
      confirmButtonColor: '#2563eb',
    });
  }
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

