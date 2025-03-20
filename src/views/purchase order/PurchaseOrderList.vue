<template>
    <VNavbar :title="title" :submodules="submodules"></VNavbar>
  
    <div v-if="purchaseOrderStore.loading">
      <VLoading :isDone="isLoaded" />
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
                  <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
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
                <tr v-for="(order, index) in filteredPurchaseOrders" :key="order.id" class="hover:bg-gray-50">
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
                    @click="deleteOrder(order.id)"
                    >
                    Delete
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
  import { ref, onMounted, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { usePurchaseOrderStore } from '../../stores/purchaseOrder.ts'
  import { useAuthStore } from '../../stores/auth'
  import VNavbar from '../../components/VNavbar.vue'
  import VButton from '../../components/VButton.vue'
  import { DataTable } from 'simple-datatables'
  
  const purchaseOrderStore = usePurchaseOrderStore()
  const authStore = useAuthStore()
  const router = useRouter()
  
  const searchTerm = ref('')
  const title = ref({ 'PurchaseOrder': '/marketing/purchase-order' })
  const submodules = ref({
    "Purchase Order": "/marketing/purchase-order",
  })
  
  const dataTableInstance = ref<DataTable | null>(null)
  
  onMounted(async () => {
    try {
      if (!authStore.token) return
      await purchaseOrderStore.fetchAll(authStore.token)
  
      const tableElement = document.getElementById('default-table')
      if (tableElement && typeof DataTable !== 'undefined') {
        dataTableInstance.value = new DataTable(tableElement, {
          searchable: false,  // Disable the built-in search
          sortable: true,
          paging: true,
        })
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error)
    }
  })
  
  const filteredPurchaseOrders = computed(() => {
    let filteredOrders = purchaseOrderStore.purchaseOrders
  
    if (searchTerm.value) {
      filteredOrders = filteredOrders.filter((order) =>
        order.companyName.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    }
  
    return filteredOrders
  })
  
  watch(filteredPurchaseOrders, (newFilteredOrders) => {
    if (dataTableInstance.value) {
      // Clear rows, add new rows, and redraw the table to reflect changes
      dataTableInstance.value.rows().clear()
      dataTableInstance.value.rows().add(newFilteredOrders)
      dataTableInstance.value.draw()
    }
  })
  
  const handleSearch = (event: Event) => {
    const searchValue = (event.target as HTMLInputElement).value
    if (dataTableInstance.value) {
      dataTableInstance.value.search(searchValue)
    }
  }
  
  async function deleteOrder(orderId: number) {
    const confirmed = confirm('Are you sure you want to delete this purchase order?')
    if (!confirmed) return
  
    if (!authStore.token) return
    const success = await purchaseOrderStore.deletePurchaseOrder(orderId, authStore.token)
    if (success) {
      window.$toast('success', 'Purchase order deleted!')
    }
  }
  </script>
  
  <style scoped>
  .purchaseorder-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    height: 100vh;
    width: 100%;
    padding: 20px;
  }
  
  .purchaseorder-card {
    background: white;
    width: 100%;
    max-width: 1200px;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    text-align: left;
    margin-top: 80px;
  }
  
  .search-bar {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .search-input {
    width: 300px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    padding-right: 30px;
  }
  
  .search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
  }
  
  .date-filter {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border: none;
  }
  
  th {
    background-color: #f4f4f4;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  
  .actions {
    margin-top: 20px;
    display: flex;
    justify-content: start;
    gap: 15px;
  }
  
  .actions button {
    padding: 8px 20px;
    background-color: #f0ad4e;
    color: white;
    border-radius: 5px;
  }

  .delete-button {
  background-color: rgb(157, 0, 0);
  color: white;
  border: none;
  margin-left: 20px;
  }

  .delete-button:hover {
  background-color: rgb(107, 0, 0);
  }
  </style>
  