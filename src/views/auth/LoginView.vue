<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const isFormValid = ref(false);
const showPassword = ref(false);
const loginFailed = ref(false);
const loginMessage = ref('');

const validateForm = () => {
  isFormValid.value = !Object.values(hasErrors.value).some(error => error);
  // Reset error message when user starts typing again
  if (loginFailed.value) {
    loginFailed.value = false;
    loginMessage.value = '';
  }
};

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

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

// Animation for the login card
onMounted(() => {
  const loginCard = document.querySelector('.login-card');
  if (loginCard) {
    loginCard.classList.add('fade-in');
  }
});
</script>

<template>
  <div class="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">
    <!-- Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -right-40 -top-40 w-96 h-96 bg-white opacity-10 rounded-full"></div>
      <div class="absolute -left-20 -bottom-20 w-72 h-72 bg-white opacity-10 rounded-full"></div>
      <div class="absolute left-1/3 top-1/4 w-48 h-48 bg-white opacity-5 rounded-full"></div>
    </div>

    <!-- Company Logo or App Name -->
    <div class="absolute top-8 left-8">
      <img src="/src/assets/logo_spa_sidebar.png" alt="Logo Sidebar" class="h-14 object-contain" />
    </div>

    <!-- Login Card -->
    <div class="login-card relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
      <!-- Card Header with Decorative Element -->
      <div class="bg-gradient-to-r from-red-400 to-red-400 h-2 w-full"></div>

      <div class="px-8 py-8">
        <!-- Loading State -->
        <div v-if="authStore.loading" class="flex min-h-[320px]">
          <VLoading :isTrueCenter="true"/>
        </div>

        <!-- Login Form -->
        <div v-else class="w-full">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
              <p class="text-gray-500 mt-2">Silakan masukkan kredensial Anda untuk mengakses akun</p>
            </div>


          <!-- Error Message -->
          <div v-if="loginFailed" class="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {{ loginMessage }}
          </div>

          <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Username Field -->
            <VInputField
              v-model="formData.username"
              label="Username"
              placeholder="Masukkan Username Anda"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('username', $event)"
              @input="validateForm"
            >
              <template #prefix>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </template>
            </VInputField>

            <!-- Password Field with Toggle Visibility -->
            <div class="relative">
              <VInputField
                v-model="formData.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan kata sandi Anda"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('password', $event)"
                @input="validateForm"
              >
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </VInputField>

              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
            <!-- Login Button -->
            <VButton
              variant="primary"
              @click="submitForm"
              :disabled="!isFormValid"
              class="w-full mt-8"
              size="md"
            >
              <span class="flex items-center justify-center">
                <span v-if="authStore.loading" class="mr-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Login
              </span>
            </VButton>
          </form>

          <!-- Registration Link -->
          <div class="text-center mt-6 text-sm">
            <p class="text-gray-600">
              Ingin Menjadi Freelancer?
              <span @click="router.push('/auth/register/freelancer')" class="text-red-400 hover:text-red-200 cursor-pointer font-medium">
                Daftar
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.5s ease;
}

.fade-in {
  transform: translateY(0);
  opacity: 1;
}

/* Optional: Hover effect for the login card */
.login-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>
