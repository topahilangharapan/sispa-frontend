<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../components/VLoading.vue'
import { useAuthStore } from '../stores/auth.ts'

const title = ref({ 'Home': '/home' });
const submodules = ref({ '': '' });

const isLoaded = ref(true);

onMounted(async () => {
    const authStore = useAuthStore()
    const savedAuth = localStorage.getItem('auth')

    if (savedAuth) {
      authStore.$patch(JSON.parse(savedAuth))
    }
});
</script>


<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>/
  <div>
    <VLoading :isDone="isLoaded" />
  </div>
</template>

<style scoped>

</style>
