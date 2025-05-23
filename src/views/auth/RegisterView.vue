<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VInputField from '../../components/VInputField.vue'
import VButton from '../../components/VButton.vue'
import { useRouter } from 'vue-router'
import VDropdown from '../../components/VDropdown.vue'
import { useAuthStore } from '../../stores/auth.ts'
import VLoading from '../../components/VLoading.vue'
import type { RoleResponseInterface } from '../../interfaces/auth.interface.ts'
import type { CommonResponseInterface } from '../../interfaces/common.interface.ts'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
})

const hasErrors = ref({
  username: true,
  email: true,
  password: true,
  role: true
})

const roleOption = ref<{ value: string; label: string }[]>([])
const isSubmitting = ref(false)

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  const fetchedRoles = await authStore.getRoles() as CommonResponseInterface<RoleResponseInterface[]> | undefined
  roleOption.value = fetchedRoles?.data?.map((role) => ({
    value: role.name,
    label: role.name,
  })) || []
})

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError
}

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
)

const submitForm = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  formData.value.name = formData.value.username

  const isSuccess = await authStore.register(formData.value)

  if (isSuccess) {
    formData.value = {
      username: '',
      name: '',
      email: '',
      password: '',
      role: '',
    }

    hasErrors.value = {
      username: true,
      email: true,
      password: true,
      role: true
    }
  }

  isSubmitting.value = false
  authStore.loading = false
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center relative"
    style="background-image: url('/background-auth.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;"
  >
    <div class="max-w-xl w-full relative">
      <!-- Header Card -->
      <div class="bg-gradient-to-r from-red-400 to-red-200 rounded-lg shadow-lg overflow-hidden">
        <div class="px-8 py-6 flex items-center justify-center">
          <h2 class="font-bold text-white text-center">Formulir Registrasi User</h2>
        </div>
      </div>

      <!-- Main form card -->
      <div class="bg-white shadow-xl rounded-lg p-8 relative overflow-hidden mt-8">
        <!-- Loading overlay -->
        <div
          v-if="authStore.loading || isSubmitting"
          class="absolute inset-0 bg-white/80 flex items-center justify-center z-10"
        >
          <VLoading :isTrueCenter="true" />
        </div>

        <form v-else @submit.prevent="submitForm" class="space-y-5">
          <VInputField
            v-model="formData.username"
            label="Nama Pengguna"
            placeholder="Masukkan nama pengguna Anda"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('username', $event)"
          />

          <VInputField
            v-model="formData.email"
            label="Alamat Email"
            placeholder="Masukkan alamat email Anda"
            :isEmpty="true"
            :minLength="5"
            @update:hasError="updateErrorStatus('email', $event)"
          />

          <VInputField
            v-model="formData.password"
            label="Kata Sandi"
            type="password"
            placeholder="Buat kata sandi yang aman"
            :isEmpty="true"
            :minLength="6"
            @update:hasError="updateErrorStatus('password', $event)"
          />

          <VDropdown
            v-model="formData.role"
            label="Pilih Peran"
            :options="roleOption"
            placeholder="Pilih peran Anda"
            :isEmpty="true"
            :selectionToShow="3"
            @update:hasError="updateErrorStatus('role', $event)"
          />

          <div class="pt-2 mt-12">
            <VButton
              variant="primary"
              @click="submitForm"
              :disabled="!isFormValid || isSubmitting"
              class="w-full font-medium py-2 rounded-lg transition-colors duration-200"
              size="md"
            >
              <span v-if="isSubmitting">Membuat Akun...</span>
              <span v-else>Buat Akun</span>
            </VButton>
          </div>
        </form>
      </div>

      <!-- Navigation buttons -->
      <div class="mt-6 flex justify-between gap-4">
        <VButton
          variant="delete"
          class="flex-1 font-medium py-2 rounded-lg transition-colors duration-200 shadow-sm"
          @click="router.push('/')"
        >
          Kembali ke Beranda
        </VButton>

        <VButton
          variant="outline"
          class="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 rounded-lg transition-colors duration-200 shadow-sm"
          @click="router.back()"
        >
          Kembali
        </VButton>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="absolute bottom-4 text-center text-white/70 text-sm w-full">
    SiSPA. Made w/ <3 by Radiant.
  </div>
</template>

