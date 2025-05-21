<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import VSidebar from './components/VSidebar.vue';
import VToast from './components/VToast.vue'


const route = useRoute();

// Cek apakah halaman mengandung "auth"
const hideSidebar = computed(() =>
  route.path.includes('/auth') || route.path.includes('/design-system') || route.path.includes('/component')
);

const toastRef = ref<InstanceType<typeof VToast> | null>(null);


declare global {
  interface Window {
    $toast: (type: string, message: string) => void;
  }
}

onMounted(() => {
  window.$toast = (type, message) => {
    toastRef.value?.addToast(type, message);
  };
});
</script>

<template>
  <div class="bg-gradient-to-br from-white-200 to-white-300">
    <!-- Tampilkan Sidebar jika tidak di halaman auth -->
    <VSidebar v-if="!hideSidebar" />

    <!-- Konten utama -->
    <div :class="hideSidebar ? 'w-full min-h-screen' : 'ml-64 p-4 min-h-screen'">
      <VToast ref="toastRef" />
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
/* Add some delicate texture to the background */
.bg-gradient-to-br {
  background-image: radial-gradient(circle at center, rgba(201, 162, 103, 0.03) 0%, rgba(201, 162, 103, 0) 70%),
  linear-gradient(to bottom right, var(--color-white-200), var(--color-white-300));
  background-size: 20px 20px, 100% 100%;
}

</style>
