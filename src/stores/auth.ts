import { defineStore } from 'pinia';
import api from '@/services/api';
import type { AuthSuccess, User } from '@/types/api';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterPayload extends Credentials {
  name: string;
}

interface State {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setSession(payload: AuthSuccess) {
      this.token = payload.access_token;
      this.user = payload.user;
      localStorage.setItem('token', payload.access_token);
    },
    clearSession() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
    async fetchProfile() {
      if (!this.token) return;

      try {
        const { data } = await api.get<User>('/auth/me');
        this.user = data;
      } catch {
        this.clearSession();
      }
    },
    async login(credentials: Credentials) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<AuthSuccess>('/auth/login', credentials);
        this.setSession(data);
      } catch (error: any) {
        this.error = error.response?.data?.message ?? 'Unable to login';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async register(payload: RegisterPayload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await api.post<{ message: string; token: AuthSuccess }>('/auth/register', payload);
        if (data.token) {
          this.setSession(data.token);
        }
      } catch (error: any) {
        this.error = error.response?.data?.message ?? 'Unable to register';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        if (this.token) {
          await api.post('/auth/logout');
        }
      } catch {
        // ignore
      } finally {
        this.clearSession();
      }
    },
  },
});

