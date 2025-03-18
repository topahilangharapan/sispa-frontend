<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { ref } from 'vue'
import VLoading from '../components/VLoading.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>/
  <div>
    <VLoading :isDone="true" />
  </div>
</template>

<style scoped>

</style>
