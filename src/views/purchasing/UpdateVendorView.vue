<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useVendorStore } from '../../stores/vendor.ts'
import { useRoute, useRouter } from 'vue-router'
import VNavbar from '../../components/VNavbar.vue'
import { useAuthStore } from '../../stores/auth.ts'
import VLoading from '../../components/VLoading.vue'
import VTextArea from '../../components/VTextArea.vue'
import VInputField from '../../components/VInputField.vue'
import VButton from '../../components/VButton.vue'
import { ArrowLeft, FileText, Phone, Mail, MapPin, Briefcase, Save } from 'lucide-vue-next'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
});

const vendorStore = useVendorStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const vendorId = ref('')

const formData = ref({
  id: '',
  name: '',
  contact: '',
  email: '',
  address: '',
  service: '',
  description: '',
})

const originalContact = ref('')
const phoneChanged = ref(false)
const phoneExistsError = ref(false)
const emailError = ref(false);

watch(() => formData.value.email, (newVal) => {
  if (typeof newVal === 'string' && newVal.trim() !== '') {
    emailError.value = !newVal.includes('@');
  } else {
    emailError.value = false;
  }
});

const isDataLoaded = ref(false)
onMounted(async () => {
  vendorId.value = route.params.id as string
  if (!authStore.token) {
    console.error('Token tidak tersedia');
    return;
  }
  await vendorStore.getVendorById(authStore.token, vendorId.value);

  if (vendorStore.currentVendor) {
    formData.value = {
      id: vendorStore.currentVendor.id,
      name: vendorStore.currentVendor.name,
      contact: vendorStore.currentVendor.contact,
      email: vendorStore.currentVendor.email,
      address: vendorStore.currentVendor.address,
      service: vendorStore.currentVendor.service,
      description: vendorStore.currentVendor.description,
    }
    originalContact.value = vendorStore.currentVendor.contact
    isDataLoaded.value = true
  } else {
    console.log('Data vendor tidak ditemukan')
  }
})

watch(() => formData.value.contact, async (newVal) => {
  if (isDataLoaded.value && newVal !== originalContact.value) {
    phoneChanged.value = true

    if (newVal.trim() !== '') {
      phoneExistsError.value = await vendorStore.checkPhoneExists(newVal, vendorId.value)
    } else {
      phoneExistsError.value = false
    }
  } else {
    phoneChanged.value = false
    phoneExistsError.value = false
  }
})

const hasErrors = ref({
  contact: true,
  email: true,
  address: true,
  service: true,
  description: true,
})

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() => {
  const baseValid = Object.values(hasErrors.value).every(error => !error);
  return baseValid && !phoneExistsError.value && !emailError.value;
});

const submitForm = async () => {
  if (!isFormValid.value) {
    if (phoneExistsError.value) {
      window.$toast('error', 'Nomor telepon sudah digunakan oleh vendor lain.')
    }
    if (emailError.value) {
      window.$toast('error', 'Email harus mengandung karakter @!');
    }
    return;
  }

  try {
    const isSuccess = await vendorStore.updateVendor(formData.value, vendorId.value);

    if (isSuccess) {
      router.push(`/purchasing/vendor/${vendorId.value}`);
    }
  } catch (error) {
    console.error('Error during submit:', error);
  } finally {
    authStore.loading = false;
  }
};
</script>

<template>
  <VNavbar class="fixed top-0 left-0 w-full z-50" :title="title" :submodules="submodules" />

  <div class="min-h-screen pt-20 pb-12 px-4 md:px-8">
    <VLoading v-if="authStore.loading || vendorStore.loading" class="flex"/>

    <div v-else class="max-w-5xl mx-auto">
      <!-- Tombol Kembali dan Header -->
      <div class="mb-6">
        <div class="flex items-center space-x-2">
          <button @click="router.back()" class="flex items-center text-[#595959] hover:text-[#2E2E2E] transition duration-200">
            <ArrowLeft class="h-4 w-4 mr-1" />
            <span>Kembali</span>
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between mt-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-[#2E2E2E] flex items-center">
              <FileText :size="50" class="mr-4 text-[#B32225]" />
              Update Vendor
            </h1>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden border border-[#D8D8D8]">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-[#5D1D1E] to-[#8F2527] py-4 px-6">
          <h2 class="text-[#FFFFFF] text-lg font-medium">Detail Vendor</h2>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <form @submit.prevent="submitForm" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div class="relative">
                <label class="block text-sm font-medium text-[#595959] mb-1">Nama</label>
                <div class="px-3 py-2 border rounded-lg bg-gray-100 text-[#2E2E2E]">{{ formData.name }}</div>
              </div>

              <!-- Contact -->
              <div class="relative">
                <VInputField
                  v-model="formData.contact"
                  label="Kontak"
                  placeholder="Masukkan kontak disini"
                  :isNumberOnly="true"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('contact', $event)"
                />
                <Phone class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
                <p v-if="phoneExistsError" class="text-red-500 text-sm mt-1">
                  Nomor telepon sudah digunakan oleh vendor lain.
                </p>
              </div>

              <!-- Email -->
              <div class="relative">
                <VInputField
                  v-model="formData.email"
                  label="Email"
                  placeholder="Masukkan email disini"
                  :isEmpty="true"
                  :isEmail="true"
                  @update:hasError="updateErrorStatus('email', $event)"
                />
                <Mail class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
              </div>

              <!-- Service -->
              <div class="relative">
                <VInputField
                  v-model="formData.service"
                  label="Layanan"
                  placeholder="Masukkan layanan disini"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('service', $event)"
                />
                <Briefcase class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
              </div>
            </div>

            <!-- Address -->
            <div class="mt-6 relative">
              <VInputField
                v-model="formData.address"
                label="Alamat"
                placeholder="Masukkan alamat disini"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('address', $event)"
              />
              <MapPin class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>

            <!-- Description -->
            <div class="mt-6">
              <VTextArea
                v-model="formData.description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi disini"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('description', $event)"
              />
            </div>

            <!-- Buttons -->
            <div class="flex justify-end mt-8">
              <VButton
                variant="primary"
                @click="submitForm"
                :disabled="!isFormValid"
                size="lg"
                class="flex items-center justify-center"
              >
                <Save class="mr-2"/>
                Update
              </VButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.v-input) {
  border-color: #D8D8D8;
  transition: all 0.3s ease;
}

:deep(.v-input:focus-within) {
  border-color: #9C804F;
  box-shadow: 0 0 0 2px rgba(156, 128, 79, 0.1);
}

:deep(.v-button) {
  transition: all 0.3s ease;
}

:deep(.v-button:disabled) {
  background-color: #ADADAD;
  opacity: 0.7;
}
</style>
