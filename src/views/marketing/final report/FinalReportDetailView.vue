<template>
  <div class="w-full max-w-6xl mx-auto py-8 mt-10">
    <VNavbar :title="title" :submodules="submodules" />

    <div class="bg-white-200 rounded-xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto mt-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold text-brown-400">Laporan Akhir</h2>
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-brown-100 text-white-200">
          <FileText :size="24" />
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-brown-100 to-white-300 my-6"></div>

      <div v-if="finalReportStore.loading" class="flex flex-col items-center justify-center py-8 text-black-grey-400">
        <VLoading></VLoading>
      </div>

      <div v-if="finalReportStore.error" class="flex flex-col items-center justify-center py-8 text-red-200">
        <AlertCircle :size="24" />
        <p class="mt-2">{{ finalReportStore.error }}</p>
      </div>

      <div v-if="finalReportStore.selectedFinalReport" class="flex flex-col space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex bg-white-300 rounded-lg p-4 shadow-sm border-l-4 border-brown-200">
            <Building2 :size="20" class="text-brown-200 mt-1" />
            <div class="ml-3">
              <label class="block text-sm font-medium text-black-grey-600 mb-1">Nama Perusahaan</label>
              <p class="text-black-grey-800 font-medium">{{ finalReportStore.selectedFinalReport.company }}</p>
            </div>
          </div>

          <div class="flex bg-white-300 rounded-lg p-4 shadow-sm border-l-4 border-brown-200">
            <Calendar :size="20" class="text-brown-200 mt-1" />
            <div class="ml-3">
              <label class="block text-sm font-medium text-black-grey-600 mb-1">Nama Event</label>
              <p class="text-black-grey-800 font-medium">{{ finalReportStore.selectedFinalReport.event }}</p>
            </div>
          </div>
        </div>

        <div class="flex bg-white-300 rounded-lg p-4 shadow-sm border-l-4 border-brown-200 max-w-sm">
          <Clock :size="20" class="text-brown-200 mt-1" />
          <div class="ml-3">
            <label class="block text-sm font-medium text-black-grey-600 mb-1">Tanggal Event</label>
            <p class="text-black-grey-800 font-medium">{{ finalReportStore.selectedFinalReport.eventDate }}</p>
          </div>
        </div>

        <div class="h-px bg-gradient-to-r from-brown-100 to-white-300 my-2"></div>

        <div>
          <h3 class="flex items-center text-xl text-brown-400 mb-4">
            <Camera :size="20" class="mr-2" />
            Foto Bukti Laporan
          </h3>

          <div v-if="finalReportStore.selectedFinalReport.images.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(image, index) in finalReportStore.selectedFinalReport.images"
              :key="index"
              class="overflow-hidden rounded-lg shadow-md hover:-translate-y-1 transition-transform duration-200"
            >
              <img
                :src="'data:image/jpeg;base64,' + image.fileData"
                alt="Foto Bukti Laporan"
                class="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div v-else class="flex flex-col items-center justify-center p-8 bg-white-300 rounded-lg text-black-grey-400">
            <ImageOff :size="32" />
            <p class="mt-2">Tidak ada foto tersedia.</p>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <VButton variant="primary" size="md" @click="goBack">
            <ArrowLeft :size="18" class="inline-block align-middle mr-2" />
            Kembali ke list
          </VButton>
          <VButton @click="confirmDelete(finalReportStore.selectedFinalReport.id)" size="sm" variant="delete">
            <Trash2 :size="18" class="inline-block align-middle mr-2" />
            Hapus
          </VButton>
          <ConfirmationDialog
            :visible="showDialog"
            title="Hapus Laporan Akhir"
            message="Apakah Anda yakin ingin menghapus Laporan Akhir?"
            @confirm="deleteFinalReport"
            @cancel="showDialog = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFinalReportStore } from '../../../stores/finalReport.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import VButton from '../../../components/VButton.vue'
import VNavbar from '../../../components/VNavbar.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  Camera,
  ImageOff,
  ArrowLeft,
  Trash2,
  AlertCircle
} from 'lucide-vue-next'
import VLoading from '../../../components/VLoading.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({ "Final Report": "/marketing/final-report" });

const route = useRoute();
const router = useRouter();
const finalReportStore = useFinalReportStore();
const authStore = useAuthStore();
const showDialog = ref(false);
const selectedReportId = ref<number | null>(null);

onMounted(async () => {
  if (!authStore.token) {
    return;
  }
  const orderId = Number(route.params.id);
  await finalReportStore.fetchDetail(orderId, authStore.token);
  console.log("Selected final report:", finalReportStore.selectedFinalReport);
});

function goBack() {
  router.push('/marketing/final-report');
}

function confirmDelete(invId: number) {
  selectedReportId.value = invId;
  showDialog.value = true;
}

async function deleteFinalReport() {
  if (!selectedReportId.value) return;

  try {
    await finalReportStore.deleteFinalReport(Number(route.params.id));
    router.push('/marketing/final-report');
  } catch (error) {

  } finally {
    selectedReportId.value = null;
    showDialog.value = false;
  }
}
</script>

<!-- No scoped styles needed as we're using Tailwind CSS classes -->
