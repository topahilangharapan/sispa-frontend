<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVendorStore } from '../../stores/vendor.ts'
import VNavbar from '../../components/VNavbar.vue'
import { useAuthStore } from '../../stores/auth.ts'
import VLoading from '../../components/VLoading.vue'
import router from '../../router'
import VTextArea from '../../components/VTextArea.vue'
import VInputField from '../../components/VInputField.vue'
import VButton from '../../components/VButton.vue'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
});
const vendorStore = useVendorStore()
const authStore = useAuthStore()

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
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <main class="w-full h-screen flex justify-center items-center">
    <VLoading v-if="authStore.loading" class="flex mr-64"/>

    <div class="w-[100%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">

      <div class="w-full flex justify-between">
        <h2 class="mb-2 heading-2">Tambah Vendor Baru</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col gap-2 py-2">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <VInputField
              v-model="formData.name"
              label="Nama"
              placeholder="Masukkan nama disini"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('name', $event)"
            />
            <VInputField
              v-model="formData.contact"
              label="Kontak"
              placeholder="Masukkan kontak disini"
              :isNumberOnly="true"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('contact', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="formData.email"
              label="Email"
              placeholder="Enter text here"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('email', $event)"
            />
            <VInputField
              v-model="formData.service"
              label="Layanan"
              placeholder="Masukkan layanan disini"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('service', $event)"
            />
          </div>
        </div>

        <div>
          <VInputField
            v-model="formData.address"
            label="Alamat"
            placeholder="Masukkan alamat disini"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('address', $event)"
          />
          <VTextArea
            v-model="formData.description"
            label="Deskripsi"
            placeholder="Masukkan deskripsi disini"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('description', $event)"
          />
        </div>

        <div class="flex justify-center gap-2 py-2">
          <VButton @click="router.back()" type="button" variant="delete" class="bg-slate-600 hover:bg-slate-800 text-white">
            Kembali
          </VButton>
          <VButton variant="primary" @click="submitForm" :disabled="!isFormValid">
            Simpan
          </VButton>
        </div>
      </form>

    </div>
  </main>
</template>
