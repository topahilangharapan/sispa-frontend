<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import VSidebar from './components/VSidebar.vue';
import VToast from './components/VToast.vue'

const route = useRoute();

// Cek apakah halaman mengandung "auth"
const hideSidebar = computed(() =>
  route.path.includes('/auth') || route.path.includes('/design-system')
);

const toastRef = ref(null);

onMounted(() => {
  window.$toast = (type, message) => {
    toastRef.value?.addToast(type, message);
  };
});
</script>

<template>
  <div class="flex">
    <!-- Tampilkan Sidebar jika tidak di halaman auth -->
    <VSidebar v-if="!hideSidebar" />

    <!-- Konten utama -->
    <div :class="hideSidebar ? 'w-full min-h-screen' : 'ml-64 p-4 min-h-screen'">
      <VToast ref="toastRef" />
      <router-view />
    </div>
  </div>
</template>
