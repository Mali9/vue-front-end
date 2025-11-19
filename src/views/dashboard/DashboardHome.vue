<template>
  <div class="grid">
    <StatsCard label="Total Products" :value="stats.products" />
    <StatsCard label="Total Orders" :value="stats.orders" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import api from '@/services/api';
import StatsCard from '@/components/ui/StatsCard.vue';

const stats = reactive({
  products: 0,
  orders: 0,
});

const loadStats = async () => {
  const [productsRes, ordersRes] = await Promise.all([api.get('/products_count'), api.get('/orders')]);
  stats.products = productsRes.data;
  stats.orders = ordersRes.data.length;
};

onMounted(loadStats);
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
</style>

