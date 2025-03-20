<template>
  <div class="finalReport-container">
    <VNavbar :title="title" :submodules="submodules" />

    <div class="finalReport-card">
      <h2>Laporan Akhir</h2>
      <br>
      <hr class="divider" />
      <br>

      <p v-if="finalReportStore.loading">Loading...</p>
      <p v-if="finalReportStore.error" style="color:red;">
        {{ finalReportStore.error }}
      </p>

      <div v-if="finalReportStore.selectedFinalReport">
        <div class="row">
          <div class="detail-field half">
            <label>Nama Perusahaan</label>
            <p>{{ finalReportStore.selectedFinalReport.company }}</p>
          </div>

          <div class="detail-field half">
            <label>Nama Event</label>
            <p>{{ finalReportStore.selectedFinalReport.event }}</p>
          </div>
        </div>

        <div class="detail-field">
          <label>Tanggal Event</label>
          <p>{{ finalReportStore.selectedFinalReport.eventDate }}</p>
        </div>

        <hr class="divider" />
        <br>

        <h3>Foto Bukti Laporan</h3>
        <div v-if="finalReportStore.selectedFinalReport.images.length">
          <div v-for="(image, index) in finalReportStore.selectedFinalReport.images" :key="index">
            <img
              :src="'data:image/jpeg;base64,' + image.fileData"
              alt="Foto Bukti Laporan"
              class="finalReport-image"
            />
          </div>
        </div>
        <p v-else>Tidak ada foto tersedia.</p>

        <div class="actions">
          <VButton variant="primary" size="md" @click="goBack">
            Kembali ke list
          </VButton>
          <VButton @click="confirmDelete(finalReportStore.selectedFinalReport.id)" size="sm" variant="delete">
            Hapus
          </VButton>
<!--          <ConfirmationDialog-->
<!--            :visible="showDialog"-->
<!--            title="Hapus Laporan Akhir"-->
<!--            message="Apakah Anda yakin ingin menghapus Laporan Akhir?"-->
<!--            @confirm="deleteFinalReport"-->
<!--            @cancel="showDialog = false"-->
<!--          />-->
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
// import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

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

// async function deleteFinalReport() {
//   if (!selectedReportId.value) return;
//
//   const success = await finalReportStore.deleteFinalReport(Number(route.params.id));
//   if (success) {
//     window.$toast('success', 'Final report berhasil dihapus!');
//     router.push('/marketing/final-report'); // Redirect ke list setelah hapus
//     return true
//   }
//   selectedReportId.value = null;
//   showDialog.value = false;
// }
</script>

<style scoped>
.finalReport-container {
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 1200px;
  padding-top: 50px;
  padding-left: 150px;
}

.finalReport-card {
  background: white;
  width: 70%;
  max-width: 900px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.detail-field {
  margin-bottom: 20px;
}

.detail-field label {
  font-weight: bold;
  display: block;
}

.detail-field p {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  margin-top: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #f0f0f0;
  padding: 10px;
  text-align: left;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

.finalReport-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-top: 10px;
}
</style>
