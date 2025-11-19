<template>
  <div class="stat-card">
    <p>{{ label }}</p>
    <h3>{{ value }}</h3>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
}>();
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 15px 30px -20px rgba(37, 99, 235, 0.8);
}

.stat-card p {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
}
</style>

