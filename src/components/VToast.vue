<script setup lang="ts">
import { ref } from 'vue';

const toasts = ref<{ id: number; type: 'success' | 'error' | 'info'; message: string }[]>([]);
let toastId = 0;

const addToast = (type: 'success' | 'error' | 'info', message: string) => {
  const id = toastId++;
  toasts.value.push({ id, type, message });

  setTimeout(() => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  }, 3000);
};

defineExpose({ addToast });
</script>

<template>
  <div class="fixed top-4 right-5 space-y-2 z-50">
    <transition-group name="fade">
      <div v-for="toast in toasts" :key="toast.id"
           @click="toasts = toasts.filter(t => t.id !== toast.id)"
           class="cursor-pointer px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 text-white-100 text-semibold"
           :class="{
          'bg-green-700': toast.type === 'success',
          'bg-red-200': toast.type === 'error',
          'bg-brown-200': toast.type === 'info'
        }"
      >
        <p>{{ toast.message }}</p>
      </div>
    </transition-group>
  </div>
</template>


<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
