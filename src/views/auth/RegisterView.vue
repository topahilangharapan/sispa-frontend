<script setup lang="ts">
import { ref, computed } from 'vue';
import VInputField from '../../components/VInputField.vue';
import VButton from '../../components/VButton.vue';
import { useRouter } from 'vue-router';
import VDropdown from '../../components/VDropdown.vue'

const router = useRouter();

const formData = ref({
  username: '',
  email: '',
  password: '',
  role:'',
});

const hasErrors = ref({
  username: true,
  email: true,
  password: true,
  role: true
});

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const submitForm = () => {
  if (!isFormValid.value) return;

  // Simulasi API call
  setTimeout(() => {
    // alert('Akun berhasil dibuat! Silakan login.');
    // router.push('/login');
    window.$toast('success', 'Login gagal, periksa kembali kredensial Anda!');
  }, 1000);
};

const options = [
  { value: 'option1', label: 'Opsi 1' },
  { value: 'option2', label: 'Opsi 2' },
  { value: 'option3', label: 'Opsi 3' }
];
</script>

<template>
  <div class="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">
    <div class="pl-12 pr-12 pt-8 pb-8 bg-white-100/80 rounded-2xl shadow-lg w-[36rem] backdrop-blur-md">
      <h2 class="text-xl  mb-4 text-center">Daftar Akun</h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <VInputField
          v-model="formData.username"
          label="Username"
          placeholder="Masukkan username"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('username', $event)"
        />
        <VInputField
          v-model="formData.email"
          label="Email"
          placeholder="Masukkan email"
          :isEmpty="true"
          :minLength="5"
          @update:hasError="updateErrorStatus('email', $event)"
        />
        <VInputField
          v-model="formData.password"
          label="Password"
          type="password"
          placeholder="Masukkan password"
          :isEmpty="true"
          :minLength="6"
          @update:hasError="updateErrorStatus('password', $event)"
        />
        <VDropdown
          v-model="formData.role"
          label="Role"
          :options="options"
          placeholder="Silakan pilih"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('role', $event)"
        />

        <VButton variant="primary" @click="submitForm" :disabled="!isFormValid" class="w-full mt-6"  size="md">
          Daftar
        </VButton>
      </form>
      <p class="text-normal text-center mt-4">Sudah punya akun?
        <span @click="router.push('/auth/login')" class="text-blue-500 cursor-pointer text-normal">Masuk di sini</span>
      </p>
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
