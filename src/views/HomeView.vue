<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { ref } from 'vue'

const title = ref("Home");
const submodules = ref(["Sub 1", "Sub 2", "Sub 3"]);
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>/

</template>

<style scoped>

</style>
