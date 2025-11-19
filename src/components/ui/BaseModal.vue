<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  z-index: 50;
}

.modal {
  width: min(520px, 92vw);
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 25px 60px -25px rgba(15, 23, 42, 0.75);
}
</style>

