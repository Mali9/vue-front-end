import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Order } from '@/types/api';

interface OrderFormData {
  address: string;
  phone: string;
}

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const hasOrders = computed(() => orders.value.length > 0);
  const orderCount = computed(() => orders.value.length);

  // Actions
  const fetchOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get<Order[]>('/orders');
      orders.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load orders';
      console.error('Failed to load orders:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOrder = async (orderData: OrderFormData) => {
    loading.value = true;
    error.value = null;
    try {
      await api.post('/orders', orderData);
      await fetchOrders();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create order';
      console.error('Failed to create order:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleString();
  };

  return {
    // State
    orders,
    loading,
    error,
    // Getters
    hasOrders,
    orderCount,
    // Actions
    fetchOrders,
    createOrder,
    formatDate,
  };
});

