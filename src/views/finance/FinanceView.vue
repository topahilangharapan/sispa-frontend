<script setup lang="ts">
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'

</script>

<template>
  <VNavbar/>
  <div>
    <VLoading :isDone="true" />
  </div>
</template>

<style scoped>

</style>
