<script setup lang="ts">

import { useAuthStore } from '../../../stores/auth.ts'
import { useRouter } from 'vue-router'
import { useFinalReportStore } from '../../../stores/finalReport.ts'
import { computed, onMounted, ref, toRaw } from 'vue'
import type { CreateFinalReportRequestInterface } from '../../../interfaces/finalReport.interface.ts'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputField from '../../../components/VInputField.vue'
import VInputImageField from '../../../components/VInputImageField.vue'
import VButton from '../../../components/VButton.vue'

const authStore = useAuthStore();
const router = useRouter();
const finalReportStore = useFinalReportStore();
const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
});

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }
});

const today = new Date().toISOString().split('T')[0];

const finalReportData = ref<CreateFinalReportRequestInterface>({
  event: '',
  tanggal: today,
  perusahaan: '',
});

const images = ref<File[]>([]);
const hasErrors = ref({ title: true, description: true });

const updateErrorStatus = (field: string, status: boolean) => {
  hasErrors.value[field] = status;
};

const handleFiles = (files: File[]) => {
  images.value = files;
};

const isFormValid = computed(() => Object.values(hasErrors.value).every(error => !error));

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const submitReport = async () => {

  const formattedFinalReport = {
    ...toRaw(finalReportData.value),
    tanggal: formatDate(finalReportData.value.tanggal),
  };

  const formData = new FormData();
  formData.append('data', JSON.stringify(formattedFinalReport));
  images.value.forEach((image) => formData.append('images', image));

  console.log(formData)

  const isSuccess = await finalReportStore.create(formData, authStore.token);
  if (isSuccess) {
    await router.push('/marketing/final-report');
  }
};
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50"></VNavbar>
  <VLoading v-if="finalReportStore.loading" class="flex"/>

  <div v-else class="p-8 mt-12 w-full min-h-screen">
    <h2 class="mb-6">Tambah Final Report</h2>
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VInputField
          label="Nama Acara"
          v-model="finalReportData.event"
          placeholder="Masukkan nama acara"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('title', $event)"
        />
        <VInputField
          label="Nama Perusahaan"
          v-model="finalReportData.perusahaan"
          placeholder="Masukkan nama perusahaan"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('description', $event)"
        />
        <VInputField
          label="Tanggal"
          v-model="finalReportData.tanggal"
          type="date"
        />
      </div>
      <div class="mt-6">
        <VInputImageField
          @update:files="handleFiles"
          @update:hasError="updateErrorStatus('image', $event)"
          :maxSize="2 * 1024 * 1024"
          :maxImages="8"
          :minImages="1"
          aspectRatio="4:3"
          :allowedTypes="['image/jpeg', 'image/png', 'image/jpg']"
        />
      </div>
      <div class="flex justify-end mt-6">
        <VButton
          variant="primary"
          :disabled="!isFormValid"
          @click="submitReport"
          size="lg"
        >
          Simpan Laporan
        </VButton>
      </div>
    </div>
  </div>
</template>
