<script setup lang="ts">
import VSidebar from './components/VSidebar.vue'
</script>

<template>
  <VSidebar></VSidebar>
  <div class="ml-64 p-4 min-h-screen">
    <router-view />
  </div>
</template>

<style>

</style>
