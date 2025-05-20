<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VInputField from '../../components/VInputField.vue';
import VButton from '../../components/VButton.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.ts';
import VLoading from '../../components/VLoading.vue';

interface LoginRequestInterface {
  username: string;
  password: string;
}

const router = useRouter();
const authStore = useAuthStore();

const formData = ref<LoginRequestInterface>({
  username: '',
  password: ''
});

const hasErrors = ref({
  username: true,
  password: true
});

const updateErrorStatus = (field: keyof LoginRequestInterface, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const showPassword = ref(false);
const loginFailed = ref(false);
const loginMessage = ref('');

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const submitForm = async () => {
  if (!isFormValid.value) return;

  const isSuccess = await authStore.login(formData.value);

  if (isSuccess) {
    await router.push('/dashboard');
  } else {
    loginFailed.value = true;
    loginMessage.value = authStore.error ?? '';
  }
};

onMounted(() => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 relative" style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">
    <!-- Card -->
    <div class="relative w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden z-10">

      <!-- Loading overlay -->
      <div
        v-if="authStore.loading"
        class="absolute inset-0 bg-white flex items-center justify-center z-20"
      >
        <div class="p-8 rounded-lg flex flex-col items-center">
          <VLoading :isTrueCenter="true" />
        </div>
      </div>

      <!-- Left: Gambar -->
      <div class="hidden md:block md:w-2/5 bg-cover bg-center relative" style="background-image: url('/background-auth.jpg')">
        <div class="absolute inset-0 bg-gradient-to-b from-red-400 to-red-200"></div>
        <div class="relative h-full flex flex-col justify-end p-8 text-white">
          <h1 class="text-3xl font-bold mb-40">Selamat Datang</h1>
        </div>
      </div>

      <!-- Right: Form -->
      <div class="w-full md:w-3/5 p-8 flex items-center justify-center">
        <div class="w-full max-w-md flex flex-col items-center justify-center h-full">
          <!-- Username Field -->
          <VInputField
            v-model="formData.username"
            label="Username"
            placeholder="Masukkan Username Anda"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('username', $event)"
            class="input-animated w-full"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </template>
          </VInputField>

          <!-- Password Field -->
          <div class="relative w-full mt-4">
            <VInputField
              v-model="formData.password"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan kata sandi Anda"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('password', $event)"
              class="input-animated w-full"
            >
            </VInputField>
          </div>

          <!-- Login Button -->
          <VButton
            variant="primary"
            class="w-full mt-8"
            @click="submitForm"
            :disabled="!isFormValid"
            size="md"
          >
            Login
          </VButton>

          <!-- Bottom section with register link -->
          <div class="mt-4 text-sm text-center text-gray-600">
            Ingin Menjadi Freelancer?
            <button @click="router.push('/auth/register/freelancer')" class="text-red-400 font-medium hover:text-red-200 focus:outline-none">
              Daftar di sini
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div class="absolute bottom-4 text-center text-white/70 text-sm w-full">
      SiSPA. Made w/ <3 by Radiant.
    </div>
  </div>
</template>


<style scoped>
/* Custom animations */
.input-animated:focus-within label {
  transform: translateY(-1px);
}

/* Button animations */
button {
  transition: all 0.2s ease-in-out;
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Apply animation to current form step */
[v-if] {
  animation: fadeIn 0.4s ease-out;
}
</style>
