<script setup lang="ts">
//Create Final Report
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
import { Calendar, Building2, PartyPopper, Image, Save, ArrowLeft, FileText } from 'lucide-vue-next'

const authStore = useAuthStore();
const router = useRouter();
const finalReportStore = useFinalReportStore();

// Form data
const today = new Date().toISOString().split('T')[0];
const finalReportData = ref<CreateFinalReportRequestInterface>({
  event: '',
  tanggal: today,
  perusahaan: '',
});

// Form validation
const images = ref<File[]>([]);
const hasErrors = ref<{ [key: string]: boolean }>({
  event: true,
  perusahaan: true,
  images: true
});
const isFormValid = computed(() => Object.values(hasErrors.value).every(error => !error));

// Check for authentication on mount
onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }
});

// Form handling functions
const updateErrorStatus = (field: string, status: boolean) => {
  hasErrors.value[field] = status;
};

const handleFiles = (files: File[]) => {
  images.value = files;
  hasErrors.value.images = files.length === 0;
};

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

  if (!authStore.token) {
    console.error('Token tidak tersedia');
    return;
  }

  const isSuccess = await finalReportStore.create(formData, authStore.token);
  if (isSuccess) {
    await router.push('/marketing/final-report');
  }
};
</script>

<template>
  <VNavbar class="fixed top-0 left-0 w-full z-50"></VNavbar>

  <div class="min-h-screen pt-20 pb-12 px-4 md:px-8">
    <!-- Loading state -->
    <VLoading v-if="finalReportStore.loading" class="flex"/>

    <div v-else class="max-w-5xl mx-auto">
      <div class="max-w-screen-lg mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center space-x-2">
            <button @click="router.push('/marketing/final-report')" class="flex items-center text-[#595959] hover:text-[#2E2E2E] transition duration-200">
              <ArrowLeft class="h-4 w-4 mr-1" />
              <span>Kembali</span>
            </button>
          </div>

          <div class="flex flex-col md:flex-row md:items-center justify-between mt-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-[#2E2E2E] flex items-center">
                <FileText :size="50" class="mr-4 text-[#B32225]" />
                Tambah Final Report Baru
              </h1>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden border border-[#D8D8D8]">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-[#5D1D1E] to-[#8F2527] py-4 px-6">
          <h2 class="text-[#FFFFFF] text-lg font-medium">Detail Laporan</h2>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Event Name -->
            <div class="relative">
              <VInputField
                label="Nama Acara"
                v-model="finalReportData.event"
                placeholder="Masukkan nama acara"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('event', $event)"
              />
              <PartyPopper class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>

            <!-- Company Name -->
            <div class="relative">
              <VInputField
                label="Nama Perusahaan"
                v-model="finalReportData.perusahaan"
                placeholder="Masukkan nama perusahaan"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('perusahaan', $event)"
              />
              <Building2 class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>

            <!-- Date -->
            <div class="relative">
              <VInputField
                label="Tanggal"
                v-model="finalReportData.tanggal"
                type="date"
              />
              <Calendar class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>
          </div>

          <!-- Image Upload Section -->
          <div class="mt-8">
            <div class="flex items-center mb-3">
              <Image class="w-5 h-5 mr-2 text-[#8F2527]" />
              <h3 class="text-[#483B24] font-medium">Dokumentasi Acara</h3>
            </div>
            <div class=" rounded-lg p-1">
              <VInputImageField
                @update:files="handleFiles"
                @update:hasError="updateErrorStatus('images', $event)"
                :maxSize="2 * 1024 * 1024"
                :maxImages="8"
                :minImages="1"
                aspectRatio="4:3"
                :allowedTypes="['image/jpeg', 'image/png', 'image/jpg']"
              />
            </div>
            <p class="text-sm text-[#838383] mt-2">
              Format: JPG, PNG. Ukuran maksimal: 2MB. Minimal 1 gambar, maksimal 8 gambar.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end m">
            <VButton
              variant="primary"
              :disabled="!isFormValid"
              @click="submitReport"
              size="lg"
              class="flex items-center justify-center"
            >
              <Save class="mr-4"/>
              Simpan Laporan
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles to enhance the visual appeal */
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
