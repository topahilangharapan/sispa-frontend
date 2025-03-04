<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { ref } from 'vue'
import VLoading from '../components/VLoading.vue'

const title = ref("Staff and Freelancer");
const submodules = ref([""]);
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>/
  <div>
    <VLoading :isDone="isLoaded" />
  </div>
</template>

<style scoped>

</style>
