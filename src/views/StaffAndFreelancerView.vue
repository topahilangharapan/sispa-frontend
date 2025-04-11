<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { ref } from 'vue'
import VLoading from '../components/VLoading.vue'


const title = ref({ 'Staff and Freelancer': '/staff-freelancer' });
const submodules = ref();
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>/
  <div>
    <VLoading :isDone="true" />
  </div>
</template>

<style scoped>

</style>
