<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import VButton from './VButton.vue'
import { CheckCircle, AlertCircle, ChevronLeft, Home, AlertTriangle, Info } from 'lucide-vue-next'

const route = useRoute()

// Extract and process query parameters
const title = ref(route.query.title || 'Message Received')
const information = ref(
  typeof route.query.information === 'string'
    ? route.query.information.split(';')
    : ['']
)
const buttonUrl = ref(route.query.url || '/dashboard')

// Determine message type based on title keywords
const messageType = computed(() => {
  const titleText = title.value.toString().toLowerCase()

  if (titleText.includes('berhasil') || titleText.includes('success')) {
    return 'success'
  } else if (titleText.includes('gagal') || titleText.includes('fail') || titleText.includes('error')) {
    return 'error'
  } else if (titleText.includes('peringatan') || titleText.includes('warning')) {
    return 'warning'
  } else {
    return 'info'
  }
})

// Format the button text based on URL
const buttonText = computed(() => {
  if (buttonUrl.value.includes('dashboard')) {
    return 'Kembali ke Dashboard'
  } else if (buttonUrl.value.includes('home')) {
    return 'Kembali ke Home'
  } else if (buttonUrl.value.includes('login')) {
    return 'Kembali ke Login'
  } else {
    return 'Lanjut'
  }
})

function goToUrl() {
  window.location.href = buttonUrl.value as string;
}

// Get estimated read time
const readTimeSeconds = computed(() => {
  // Average reading speed: ~200 words per minute or ~3.33 words per second
  const wordCount = information.value.reduce((acc, text) => acc + text.split(' ').length, 0)
  return Math.max(Math.ceil(wordCount / 3.33), 5) // Minimum 5 seconds
})
</script>

<template>
  <div class="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
       :style="{ backgroundImage: 'url(/background-auth.jpg)', backgroundAttachment: 'fixed' }">
    <section class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div class="bg-white/95 shadow-xl rounded-3xl p-8 max-w-lg w-full backdrop-blur-sm transform transition-all duration-500 hover:shadow-2xl">
        <!-- Status Icon -->
        <div class="flex justify-center mb-6">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center"
            :class="{
              'bg-green-100': messageType === 'success',
              'bg-red-100': messageType === 'error',
              'bg-yellow-100': messageType === 'warning',
              'bg-blue-100': messageType === 'info'
            }"
          >
            <CheckCircle v-if="messageType === 'success'" :size="32" class="text-green-600" strokeWidth="2" />
            <AlertCircle v-else-if="messageType === 'error'" :size="32" class="text-red-600" strokeWidth="2" />
            <AlertTriangle v-else-if="messageType === 'warning'" :size="32" class="text-yellow-600" strokeWidth="2" />
            <Info v-else :size="32" class="text-blue-600" strokeWidth="2" />
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold mb-4"
            :class="{
              'text-green-600': messageType === 'success',
              'text-red-600': messageType === 'error',
              'text-yellow-600': messageType === 'warning',
              'text-blue-600': messageType === 'info'
            }">
          {{ title }}
        </h2>

        <!-- Information -->
        <div class="bg-gray-50 rounded-xl p-6 mb-6 border"
             :class="{
               'border-green-200': messageType === 'success',
               'border-red-200': messageType === 'error',
               'border-yellow-200': messageType === 'warning',
               'border-blue-200': messageType === 'info'
             }">
          <p class="text-gray-700 mb-3" v-for="(info, index) in information" :key="index">
            {{ info }}
          </p>

          <!-- Read time indicator -->
          <div class="flex items-center justify-center mt-4 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ readTimeSeconds }} second read</span>
          </div>
        </div>

        <!-- Action Button -->
        <VButton
          class="px-6 py-3 rounded-full w-full transition duration-300 flex items-center justify-center"
          :class="{
            'bg-green-600 hover:bg-green-700 text-white': messageType === 'success',
            'bg-red-600 hover:bg-red-700 text-white': messageType === 'error',
            'bg-yellow-600 hover:bg-yellow-700 text-white': messageType === 'warning',
            'bg-blue-600 hover:bg-blue-700 text-white': messageType === 'info'
          }"
          @click="goToUrl"
        >
          <ChevronLeft v-if="buttonUrl.includes('dashboard')" :size="18" class="mr-2" />
          <Home v-else-if="buttonUrl.includes('home')" :size="18" class="mr-2" />
          <span>{{ buttonText }}</span>
        </VButton>

      </div>
    </section>
  </div>
</template>

<style scoped>
.bg-cover {
  background-size: cover;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

section {
  animation: fadeIn 0.6s ease-out;
}

/* Add responsive adjustments */
@media (max-width: 640px) {
  section {
    padding: 1rem;
  }

  .max-w-lg {
    max-width: 90%;
  }
}
</style>
