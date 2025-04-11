<template>
  <VNavbar :title="title"></VNavbar>

  <div v-if="purchaseOrderStore.loading">
    <VLoading class="flex"/>
  </div>

  <div class="p-8 bg-white-100 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-screen-xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg w-full">
        <div class="flex items-center justify-between mb-2">
          <h2 class="heading-2">Purchase Order</h2>
          <div class="flex space-x-2">
            <div class="relative">
              <input
                type="text"
                placeholder="Cari purchase order..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                @input="handleSearch"
              />
              <span class="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
            </div>
            <RouterLink :to="`/marketing/purchase-order/create`">
              <VButton variant="primary" size="md">+ Tambah Purchase Order</VButton>
            </RouterLink>
          </div>
        </div>

        <hr class="border-gray-300 border-t-2 mb-4" />

        <main class="w-full overflow-x-auto">
          <table id="default-table" class="w-full">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-center">No</th>
                <th class="px-4 py-2 text-left">PO ID</th>
                <th class="px-4 py-2 text-left">Nama Perusahaan</th>
                <th class="px-4 py-2 text-left">Tanggal</th>
                <th class="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, index) in purchaseOrderStore.purchaseOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-center">{{ index + 1 }}</td>
                <td class="px-4 py-2 text-left">{{ order.id }}</td>
                <td class="px-4 py-2 text-left">{{ order.companyName }}</td>
                <td class="px-4 py-2 text-left">{{ order.dateCreated }}</td>
                <td class="px-4 py-2 text-center">
                  <RouterLink :to="`/marketing/purchase-order/${order.id}`">
                    <VButton variant="primary" size="sm">Detail</VButton>
                  </RouterLink>
                  
                  <VButton 
                    class="delete-button"
                    size="sm"
                    variant="delete"
                    @click="checkAndDeleteOrder(order)"
                  >
                    Delete
                  </VButton>
                  
                  <ConfirmationDialog
                    :visible="showDialog === order.id"
                    title="Hapus Purchase Order"
                    message="Apakah Anda yakin ingin menghapus Purchase Order?"
                    @confirm="deletePurchaseOrder(order.id)"
                    @cancel="() => (showDialog = null)"
                  />
                  
                  <VButton
                    variant="primary"
                    size="sm"
                    @click="downloadPurchaseOrder(order.id, authStore.token || '')"
                  >
                    Download PDF
                  </VButton>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useAuthStore } from '../../../stores/auth'
import { useVendorStore } from '../../../stores/vendor.ts'
import VNavbar from '../../../components/VNavbar.vue'
import VButton from '../../../components/VButton.vue'
import VLoading from '../../../components/VLoading.vue'
import { DataTable } from 'simple-datatables'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'
import { RouterLink } from 'vue-router'

const purchaseOrderStore = usePurchaseOrderStore()
const authStore = useAuthStore()
const vendorStore = useVendorStore()

const title = ref({ 'Marketing': '/marketing' })
const dataTableInstance = ref<DataTable | null>(null)
const showDialog = ref<number | null>(null) // Store the ID of order to delete

onMounted(async () => {
  if (!authStore.token) return
  await purchaseOrderStore.fetchAll(authStore.token)

  // Initialize DataTable only once
  if (document.getElementById('default-table')) {
    dataTableInstance.value = new DataTable('#default-table', {
      searchable: false,
      sortable: true,
      paging: true,
    })
  }
})

const handleSearch = (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value
  if (dataTableInstance.value) {
    dataTableInstance.value.search(searchValue)
  }
}

const checkAndDeleteOrder = async (order: any) => {
  // Make sure vendors are loaded first
  if (!vendorStore.vendors.length && authStore.token) {
    await vendorStore.getVendors(authStore.token);
  }
  
  const vendorId = order.vendorId;
  
  // If vendorId exists AND we can find a matching vendor in the database
  if (vendorId && vendorId !== "") {
    const vendor = vendorStore.vendors.find(v => String(v.id) === String(vendorId));
    
    // If we found the vendor, it means it's still active
    if (vendor) {
      // Show warning toast and prevent deletion
      window.$toast('warning', 'Purchase Order tidak dapat dihapus karena masih terkait dengan vendor yang aktif dalam database.');
      return; // Important: Exit the function here to prevent showing the dialog
    }
  }
  
  // If we get here, it's safe to show the confirmation dialog
  showDialog.value = order.id;
};

const deletePurchaseOrder = async (id: number) => {
  // Get the order by id
  const orderToDelete = purchaseOrderStore.purchaseOrders.find(order => order.id === id);
  if (!orderToDelete) return;
  
  // Double check vendor connection before proceeding
  const vendorId = orderToDelete.vendorId;
  if (vendorId && vendorId !== "") {
    const vendor = vendorStore.vendors.find(v => String(v.id) === String(vendorId));
    if (vendor) {
      // Vendor still exists, cancel deletion
      showDialog.value = null;
      window.$toast('warning', 'Purchase Order tidak dapat dihapus karena masih terkait dengan vendor yang aktif.');
      return;
    }
  }
  
  // Safe to delete, proceed
  if (!authStore.token) return;
  
  // Process the deletion
  const success = await purchaseOrderStore.deletePurchaseOrder(id, authStore.token || '');
  
  // Close the dialog
  showDialog.value = null;
  
  if (success) {
    window.$toast('success', 'Purchase order berhasil dihapus!');
    // Refresh data
    await purchaseOrderStore.fetchAll(authStore.token || '');
  } else {
    window.$toast('error', 'Gagal menghapus purchase order!');
  }
}

const downloadPurchaseOrder = async (id: number, token: string) => {
  try {
    await purchaseOrderStore.downloadPurchaseOrder(id, token)
  } catch (error) {
    window.$toast('error', 'Gagal mengunduh purchase order!')
  }
}
</script>