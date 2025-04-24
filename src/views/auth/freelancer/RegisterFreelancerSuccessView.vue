<script setup lang="ts">
import { useRouter } from 'vue-router'
import VButton from '../../../components/VButton.vue'
const router = useRouter()

function goToLogin() {
  router.push('/auth/login')
}
</script>

<template>
  <div class="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-attachment: fixed;">
  <section class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <div class="bg-white/80 shadow-lg rounded-2xl p-8 max-w-md w-full">
      <h2 class="text-green-600 mb-8">Registrasi Berhasil!</h2>
      <p class="text-semibold text-black-grey-700">
        Terima kasih sudah mendaftar.
      </p>
      <p class="text-semibold text-black-grey-700">
        Tim SPA akan menghubungi Anda untuk informasi selanjutnya.
      </p>
      <p class="text-semibold text-black-grey-700 mb-8">
        Jika ada pertanyaan, silakan kirim email ke <span class="font-medium text-blue-600">adrasa.cantya@ui.ac.id</span>.
      </p>

      <VButton
        class="px-5 py-2 rounded-md w-full"
        @click="goToLogin"
      >
        Kembali ke Login
      </VButton>
    </div>
  </section>
  </div>
</template>


