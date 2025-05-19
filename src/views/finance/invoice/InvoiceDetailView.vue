<template>
    <div class="invoice-container">
      <VNavbar/>

      <div class="invoice-card">
        <h2>Invoice</h2>
        <br>
        <hr class="divider" />
        <br>

        <p v-if="invoiceStore.loading">Loading...</p>
        <p v-if="invoiceStore.error" style="color:red;">
          {{ invoiceStore.error }}
        </p>

        <div v-if="invoiceStore.selectedInvoice">
          <div class="row">
            <div class="detail-field half">
              <label>No. Invoice</label>
              <p>{{ invoiceStore.selectedInvoice.noInvoice }}</p>
            </div>

            <div class="detail-field half">
              <label>No. PO</label>
              <p>{{ invoiceStore.selectedInvoice.noPo }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label>Diperuntukkan</label>
            <p>{{ invoiceStore.selectedInvoice.receiver }}</p>
          </div>

          <hr class="divider" />
          <br>

          <div class="detail-field">
            <label>Persentase PPn</label>
            <p>{{ invoiceStore.selectedInvoice.ppnPercentage }}</p>
          </div>

          <div class="detail-field">
            <label>Nama Bank</label>
            <p>{{ invoiceStore.selectedInvoice.bankName }}</p>
          </div>

          <div class="detail-field">
            <label>Nomor Rekening</label>
            <p>{{ invoiceStore.selectedInvoice.accountNumber }}</p>
          </div>

          <div class="detail-field">
            <label>Nama Rekening (a.n.)</label>
            <p>{{ invoiceStore.selectedInvoice.onBehalf }}</p>
          </div>

          <hr class="divider" />
          <br>

          <div class="detail-field">
            <label>Ditandatangani Oleh</label>
            <p>{{ invoiceStore.selectedInvoice.signee }}</p>
          </div>

          <div class="detail-field">
            <label>Ditandatangani di</label>
            <p>{{ invoiceStore.selectedInvoice.placeSigned }}</p>
          </div>

          <div class="detail-field">
            <label>Ditandatangani pada</label>
            <p>{{ invoiceStore.selectedInvoice.dateSigned }}</p>
          </div>

          <hr class="divider" />
          <br>

          <h3>Items</h3>
          <table v-if="invoiceStore.selectedInvoice.items?.length">
            <thead>
              <tr>
                <th>No.</th>
                <th>Title</th>
                <th>Volume</th>
                <th>Unit</th>
                <th>Price per Unit</th>
                <th>Sum</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in invoiceStore.selectedInvoice.items" :key="item.id">
              <td>{{ index + 1 }}</td> <!-- Kolom Nomor -->
              <td>{{ item.title }}</td>
              <td>{{ item.volume }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.pricePerUnit }}</td>
              <td>{{ item.sum }}</td>
              <td>{{ item.description }}</td>
            </tr>
            </tbody>
          </table>
          <p v-else>No items.</p>

          <div class="actions">
            <VButton variant="primary" size="md" @click="goBack">
              Kembali ke list
            </VButton>
            <VButton @click="() => (showDialog = true)" size="sm" variant="delete">
              Hapus
            </VButton>

            <ConfirmationDialog
              :visible="showDialog"
              title="Hapus Invoice"
              message="Apakah Anda yakin ingin menghapus Invoice?"
              @confirm="deleteInvoice"
              @cancel="() => (showDialog = false)"
            />
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">

  import { useInvoiceStore } from '../../../stores/invoice.ts'
  import { useAuthStore } from '../../../stores/auth.ts'
  import { useRoute, useRouter } from 'vue-router'
  import { onMounted, ref } from 'vue'
  import VButton from '../../../components/VButton.vue'
  import VNavbar from '../../../components/VNavbar.vue'
  import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'
  const invoiceStore = useInvoiceStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const showDialog = ref(false);
  const invoiceId = Number(route.params.id) || 0;

  onMounted(async () => {
    if (!authStore.token) {
      return
    }
    await invoiceStore.fetchDetail(invoiceId, authStore.token)
    console.log("Selected Invoice:", invoiceStore.selectedInvoice)
  })

  function goBack() {
    router.push('/finance/invoice')
  }
  const deleteInvoice = async () => {
    await invoiceStore.deleteInvoice(invoiceId, authStore.token || '');
    showDialog.value = false;
    router.push('/finance/invoice')
  }
  </script>

  <style scoped>
  .invoice-container {
    /* display: flex; */
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 1200px;
    padding-top: 50px;
    padding-left: 150px;
  }

  .invoice-card {
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
  </style>
