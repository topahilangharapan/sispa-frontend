

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import VButton from './VButton.vue'

const route = useRoute()

const title = ref(route.query.title || 'Default Title')
const information = ref(route.query.information ? route.query.information.split(';') : ['No information provided.'])
const buttonUrl = ref(route.query.url || '/dashboard')

function goToUrl() {
  window.location.href = buttonUrl.value
}
</script>

<style scoped>
/* Add any additional styles here */
.bg-cover {
  background-size: cover;
}
</style>

<template>
  <div class="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
       :style="{ backgroundImage: 'url(/background-auth.jpg)', backgroundAttachment: 'fixed' }">
    <section class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div class="bg-white/90 shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h2 class="text-green-600 text-2xl font-bold mb-6">{{ title }}</h2>
        <p class="text-gray-700 mb-4" v-for="(info, index) in information" :key="index">
          {{ info }}
        </p>

        <VButton
          class="px-5 py-2 rounded-md w-full bg-green-600 text-white hover:bg-green-700 transition duration-200"
          @click="goToUrl"
        >
          Kembali
        </VButton>
      </div>
    </section>
  </div>
</template>
