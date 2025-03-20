<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { useFinalReportStore } from '../../../stores/finalReport.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRouter } from 'vue-router'
import { DataTable } from 'simple-datatables'
import VNavbar from '../../../components/VNavbar.vue'
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
const dataTableInstance = ref<DataTable | null>(null);
// const route = useRoute()
// const finalReportId = route.params.id as number;
const showDialog = ref(false);

onMounted(async () => {
  if (!authStore.token) return
  await finalReportStore.fetchAll(authStore.token)

  console.log("Final Reports Data:", finalReportStore.finalReports)

  if (document.getElementById('finalReport-table') && typeof DataTable !== 'undefined') {
    dataTableInstance.value = new DataTable('#finalReport-table', {
      searchable: false,
      sortable: true,
      paging: true,
    })
  }
})

const handleSearch = (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value;
  if (dataTableInstance.value) {
    dataTableInstance.value.search(searchValue);
  }
};

function goToDetail(invId: number) {
  router.push(`/marketing/final-report/${invId}`)
}

// const deleteFinalReport = async (id: number) => {
//   await finalReportStore.deleteFinalReport(id);
//   showDialog.value = false;
//   router.push('/marketing/final-report');
// }

// async function downloadReport(invId: number) {
//   const success = await finalReportStore.downloadFinalReport(finalReportId, authStore.token);
//   if (success) {
//     window.$toast('success', 'Final report berhasil di-download!')
//   }
// }
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />
  <div class="p-8 bg-white min-h-screen flex flex-col items-center">
    <div class="w-full max-w-screen-xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg w-full">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Daftar Laporan Akhir</h2>
          <div class="flex space-x-2">
            <input
              type="text"
              placeholder="Cari laporan akhir..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch"
            />
            <VButton @click="() => router.push('/marketing/final-report/create')" variant="primary" size="md">
              + Tambah Laporan Akhir
            </VButton>
          </div>
        </div>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <main class="w-full overflow-x-auto">
          <table id="finalReport-table" class="w-full">
            <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left">No.</th>
              <th class="px-4 py-2 text-left">Nama Perusahaan</th>
              <th class="px-4 py-2 text-left">Nama Acara</th>
              <th class="px-4 py-2 text-left">Tanggal Acara</th>
              <th class="px-4 py-2 text-center">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="inv in finalReportStore.finalReports" :key="inv.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-center">{{ inv.id }}</td>
              <td class="px-4 py-2 text-left">{{ inv.company }}</td>
              <td class="px-4 py-2 text-left">{{ inv.event }}</td>
              <td class="px-4 py-2 text-left">{{ inv.eventDate }}</td>
              <td class="px-4 py-2 text-center">
                <VButton variant="primary" size="sm" @click="goToDetail(inv.id)">Detail</VButton>
                <VButton @click="() => (showDialog = true)" size="sm" variant="delete">
                  Hapus
                </VButton>
<!--                <ConfirmationDialog-->
<!--                  :visible="showDialog"-->
<!--                  title="Hapus Laporan Akhir"-->
<!--                  message="Apakah Anda yakin ingin menghapus Laporan Akhir?"-->
<!--                  @confirm="deleteFinalReport(inv.id)"-->
<!--                  @cancel="() => (showDialog = false)"-->
<!--                />-->
<!--                <VButton variant="primary" size="sm" @click="downloadReport(inv.id)">Download PDF</VButton>-->
              </td>
            </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  </div>
</template>
