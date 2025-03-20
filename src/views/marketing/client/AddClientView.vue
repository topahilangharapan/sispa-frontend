<script setup lang="ts">


import { useClientStore } from '../../../stores/client.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { computed, ref } from 'vue'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputField from '../../../components/VInputField.vue'
import VTextArea from '../../../components/VTextArea.vue'
import VButton from '../../../components/VButton.vue'
import { useRouter } from 'vue-router'

const clientStore = useClientStore()
const authStore = useAuthStore()
const router = useRouter()

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
});

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Klien": "/marketing/client",
});

const formData = ref({
  name: '',
  contact: '',
  email: '',
  address: '',
  industry: '',
  description: '',
})

const hasErrors = ref<{ [key: string]: boolean }>({
  name: true,
  contact: true,
  email: true,
  address: true,
  industry: true,
  description: true,
});

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const submitForm = async () => {
  if (!isFormValid.value) return;

  const isSuccess = await clientStore.addClient(formData.value);

  if (isSuccess) {
    formData.value = {
      name: '',
      contact: '',
      email: '',
      address: '',
      industry: '',
      description: '',
    };

    hasErrors.value = {
      name: true,
      contact: true,
      email: true,
      address: true,
      industry: true,
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
        <h2 class="mb-2 heading-2">Tambah Klien Baru</h2>
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
              v-model="formData.industry"
              label="Industri"
              placeholder="Masukkan industri disini"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('industry', $event)"
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
