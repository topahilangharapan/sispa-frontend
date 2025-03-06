<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VInputField from '../../components/VInputField.vue';
import VButton from '../../components/VButton.vue';
import { useRouter } from 'vue-router';
import VDropdown from '../../components/VDropdown.vue'
import { useAuthStore } from '../../stores/auth.ts'
import VLoading from '../../components/VLoading.vue'

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
});

const hasErrors = ref({
  username: true,
  email: true,
  password: true,
  role: true
});

const roleOption = ref<{ value: string; label: string }[]>([]);


onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  const fetchedRoles = await authStore.getRoles();
  if (fetchedRoles) {
    roleOption.value = fetchedRoles.data.map((role) => ({
      value: role.name,
      label: role.name,
    }));
  }
});

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const submitForm = async () => {
  if (!isFormValid.value) return;

  formData.value.name = formData.value.username;

  const isSuccess = await authStore.register(formData.value);

  if (isSuccess) {
    formData.value = {
      username: '',
      name: '',
      email: '',
      password: '',
      role: '',
    };

    hasErrors.value = {
      username: true,
      email: true,
      password: true,
      role: true
    };
  }

  authStore.loading = false;
};

</script>

<template>
  <div class="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;">
    <!-- Jika masih loading, hanya tampilkan loading -->
    <VLoading v-if="authStore.loading" class="flex mr-64"/>

    <div v-else class="pl-12 pr-12 pt-8 pb-8 bg-white-100/80 rounded-2xl shadow-lg w-[36rem] backdrop-blur-md">
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
          :options="roleOption"
          placeholder="Silakan pilih"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('role', $event)"
        />


        <VButton variant="primary" @click="submitForm" :disabled="!isFormValid" class="w-full mt-6"  size="md">
          Daftar
        </VButton>
      </form>
      <hr class="border-black-grey-175 border-t-2 mt-4 mb-4" />
      <div class="flex justify-between">
        <VButton variant="primary" class="w-1/2 mr-2 bg-red-300 text-white-100 hover:bg-red-200" @click="router.push('/')">
          Home
        </VButton>
        <VButton variant="primary" class="w-1/2 ml-2 bg-white-400 hover:bg-white-300" @click="router.back()">
          Back
        </VButton>
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
