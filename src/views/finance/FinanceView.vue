<script setup lang="ts">
import { ref } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'

const title = ref({ 'Keuangan': '/finance' });
const submodules = ref({
  "Invoice": "/finance/invoice",
  "Cash Flow": "/finance/cashflow",
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
