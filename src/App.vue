<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import VSidebar from './components/VSidebar.vue';

const route = useRoute();

// Cek apakah halaman mengandung "auth"
const hideSidebar = computed(() => route.path.includes('/auth'));
</script>

<template>
  <div class="flex">
    <!-- Tampilkan Sidebar jika tidak di halaman auth -->
    <VSidebar v-if="!hideSidebar" />

    <!-- Konten utama -->
    <div :class="hideSidebar ? 'w-full p-4 min-h-screen' : 'ml-64 p-4 min-h-screen'">
      <router-view />
    </div>
  </div>
</template>
