<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVendorStore } from '../../stores/vendor.ts'
import VNavbar from '../../components/VNavbar.vue'
import { useAuthStore } from '../../stores/auth.ts'
import VLoading from '../../components/VLoading.vue'
import router from '../../router'
import VTextArea from '../../components/VTextArea.vue'
import VInputField from '../../components/VInputField.vue'
import VButton from '../../components/VButton.vue'
import { ArrowLeft, FileText, Building2, Phone, Mail, MapPin, Briefcase, ClipboardList, Save } from 'lucide-vue-next'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
});
const vendorStore = useVendorStore()
const authStore = useAuthStore()
const emailError = ref(false);

const formData = ref({
  name: '',
  contact: '',
  email: '',
  address: '',
  service: '',
  description: '',
})

const hasErrors = ref({
  name: true,
  contact: true,
  email: true,
  address: true,
  service: true,
  description: true,
});

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);
watch(() => formData.value.email, (newVal) => {
  if (typeof newVal === 'string' && newVal.trim() !== '') {
    emailError.value = !newVal.includes('@');
  } else {
    emailError.value = false;
  }
});
const submitForm = async () => {
  if (!isFormValid.value) return;

  const isSuccess = await vendorStore.addVendor(formData.value);

  if (isSuccess) {
    formData.value = {
      name: '',
      contact: '',
      email: '',
      address: '',
      service: '',
      description: '',
    };

    hasErrors.value = {
      name: true,
      contact: true,
      email: true,
      address: true,
      service: true,
      description: true,
    };
  }

  authStore.loading = false;
};

</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50"></VNavbar>

  <div class="min-h-screen pt-20 pb-12 px-4 md:px-8">
    <!-- Loading state -->
    <VLoading v-if="authStore.loading" class="flex"/>

    <div v-else class="max-w-5xl mx-auto">
      <div class="max-w-screen-lg mx-auto">
        <!-- Page Header -->
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
                Tambah Vendor Baru
              </h1>
            </div>
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
          <form @submit.prevent="submitForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Name -->
              <div class="relative">
                <VInputField
                  v-model="formData.name"
                  label="Nama"
                  placeholder="Masukkan nama disini"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('name', $event)"
                />
                <Building2 class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
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
            <div class="mt-6 relative">
              <VTextArea
                v-model="formData.description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi disini"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('description', $event)"
              />
              <ClipboardList class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end mt-8">
              <VButton
                @click="router.back()"
                type="button"
                variant="delete"
                size="lg"
                class="bg-slate-600 hover:bg-slate-800 text-white mr-4"
              >
                Kembali
              </VButton>
              <VButton
                variant="primary"
                @click="submitForm"
                :disabled="!isFormValid"
                size="lg"
                class="flex items-center justify-center"
              >
                <Save class="mr-2"/>
                Simpan
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
