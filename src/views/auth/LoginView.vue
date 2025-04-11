<script setup lang="ts">
import { ref } from 'vue';
import VInputField from '../../components/VInputField.vue';
import VButton from '../../components/VButton.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.ts';
import VLoading from '../../components/VLoading.vue'

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

const validateForm = () => {
  isFormValid.value = !Object.values(hasErrors.value).some(error => error);
};

const submitForm = async () => {
  if (!isFormValid.value) return;

  const isSuccess = await authStore.login(formData.value);

  if (isSuccess) {
    await router.push('/dashboard');
  }
};

</script>

<template>
  <div class="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">

    <!-- Card -->
    <div class="pl-12 pr-12 pt-8 pb-8 bg-white-100/80 rounded-2xl shadow-lg w-[36rem] backdrop-blur-md flex items-center justify-center min-h-[16rem]">

      <!-- Jika masih loading, hanya tampilkan loading -->
      <VLoading v-if="authStore.loading" class="flex mr-64"/>

      <!-- Jika loading selesai, tampilkan form login -->
      <div v-else class="w-full">
        <h2 class="text-xl mb-4 text-center">Login</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <VInputField
            v-model="formData.username"
            label="Username"
            placeholder="Masukkan username"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('username', $event)"
            @input="validateForm"
          />
          <VInputField
            v-model="formData.password"
            label="Password"
            type="password"
            placeholder="Masukkan password"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('password', $event)"
            @input="validateForm"
          />

          <VButton variant="primary" @click="submitForm" :disabled="!isFormValid" class="w-full mt-6" size="md">
            Login
          </VButton>
        </form>
<!--        <p class="text-normal text-center mt-4">Ingin mendaftarkan akun?-->
<!--          <span @click="router.push('/auth/register')" class="text-blue-500 cursor-pointer text-normal">Daftar di sini</span>-->
<!--        </p>-->
      </div>

    </div>

  </div>
</template>

<style scoped>
.bg-cover {
  background-size: cover;
  background-position: center;
}

.backdrop-blur-md {
  backdrop-filter: blur(10px);
}
</style>
