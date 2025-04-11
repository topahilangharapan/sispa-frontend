<template>
    <div class="purchaseorder-container">
      <VNavbar :title="title" :submodules="submodules"></VNavbar>

      <div class="purchaseorder-card">
        <h2>Purchase Order</h2>

        <p v-if="purchaseOrderStore.loading">Loading...</p>
        <p v-if="purchaseOrderStore.error" style="color:red;">
          {{ purchaseOrderStore.error }}
        </p>

        <div v-if="purchaseOrderStore.selectedPurchaseOrder">
          <!-- Example fields -->
          <div class="detail-field">
            <label>PO ID</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.id }}</p>
          </div>

          <div class="detail-field">
            <label>Nama Perusahaan</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.companyName }}</p>
          </div>

          <div class="detail-field">
            <label>Nama Perusahaan</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.companyAddress }}</p>
          </div>

          <div class="detail-field">
            <label>Nama Penerima</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.receiver }}</p>
          </div>

          <div class="detail-field">
            <label>Ketentuan</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.terms }}</p>
          </div>

          <div class="detail-field">
            <label>Tanggal Dibuat</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.dateCreated }}</p>
          </div>

          <div class="detail-field">
            <label>Tempat Ditandatangani</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.placeSigned }}</p>
          </div>

          <div class="detail-field">
            <label>Tanggal Dibuat</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.dateSigned }}</p>
          </div>

          <div class="detail-field">
            <label>Penandatangan</label>
            <p>{{ purchaseOrderStore.selectedPurchaseOrder.signee }}</p>
          </div>

          <h3>Items</h3>
          <table v-if="purchaseOrderStore.selectedPurchaseOrder.items?.length">
            <thead>
              <tr>
                <th>Title</th>
                <th>Volume</th>
                <th>Unit</th>
                <th>Price per Unit</th>
                <th>Sum</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in purchaseOrderStore.selectedPurchaseOrder.items"
                :key="item.tempId"
              >
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
              Back to List
            </VButton>
            <VButton 
              class="delete-button"
              size="sm" 
              variant="delete"
              @click="showDialog = purchaseOrderStore.selectedPurchaseOrder.id"
            >
              Delete
            </VButton>
            <ConfirmationDialog
              :visible="showDialog === purchaseOrderStore.selectedPurchaseOrder.id"
              title="Hapus Purchase Order"
              message="Apakah Anda yakin ingin menghapus Purchase Order?"
              @confirm="deleteOrder(purchaseOrderStore.selectedPurchaseOrder.id)"
              @cancel="() => (showDialog = null)"
            />
            <VButton variant="primary" size="md" 
              @click="downloadPurchaseOrder"
              :disabled="!purchaseOrderStore.selectedPurchaseOrder"
            >
              Download PDF
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup lang="ts">

  import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
  import { useAuthStore } from '../../../stores/auth.ts'
  import { useRoute, useRouter } from 'vue-router'
  import { onMounted, ref } from 'vue'
  import VButton from '../../../components/VButton.vue'
  import VNavbar from '../../../components/VNavbar.vue'
  import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

  const purchaseOrderStore = usePurchaseOrderStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const title = ref({ 'Marketing': '/marketing' });
  const submodules = ref({
    "Purchase Order": "/marketing/purchase-order",
    "Final Report": "/marketing/final-report",
    "Klien": "/marketing/client"
  });
  const showDialog = ref<number | null>(null)

  onMounted(async () => {
    if (!authStore.token) {
      // handle no token if needed
      return
    }
    const orderId = Number(route.params.id)
    await purchaseOrderStore.fetchDetail(orderId, authStore.token)
  })

  function goBack() {
    router.push('/marketing/purchase-order')
  }

  async function deleteOrder(orderId: number) {
    if (!authStore.token) return
    
    const success = await purchaseOrderStore.deletePurchaseOrder(orderId, authStore.token)
    
    showDialog.value = null
    
    if (success) {
      window.$toast('success', 'Purchase order deleted!')
      router.push('/marketing/purchase-order')
    } else {
      window.$toast('error', 'Failed to delete purchase order')
    }
  }
  
  async function downloadPurchaseOrder() {
    if (!authStore.token || !purchaseOrderStore.selectedPurchaseOrder) return;
    
    try {
      const id = purchaseOrderStore.selectedPurchaseOrder.id;
      await purchaseOrderStore.downloadPurchaseOrder(id, authStore.token);
      window.$toast('success', 'Purchase Order berhasil di-download!');
    } catch (error) {
      window.$toast('error', 'Gagal mengunduh purchase order!');
    }
  }

  </script>

  <style scoped>
  .purchaseorder-container {
    /* display: flex; */
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 1200px;
    padding-top: 50px;
    padding-left: 150px;
  }

  .purchaseorder-card {
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
