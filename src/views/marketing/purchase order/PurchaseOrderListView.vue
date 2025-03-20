<template>
  <div class="purchaseorder-container">
    <VNavbar :title="title" :submodules="submodules"></VNavbar>

    <div class="purchaseorder-card">
      <h2>Purchase Orders</h2>

      <!-- Example: possibly a search filter using VInputField -->
      <div class="search-bar">
        <VInputField
          label="Search by company name"
          v-model="searchTerm"
          placeholder="Type a company name..."
        />
        <VButton @click="searchPurchaseOrders" size="md"> Search </VButton>
      </div>

      <p v-if="purchaseOrderStore.loading">Loading...</p>
      <p v-if="purchaseOrderStore.error" style="color: red">
        {{ purchaseOrderStore.error }}
      </p>

      <!-- Table of all purchase orders -->
      <table v-if="!purchaseOrderStore.loading && !purchaseOrderStore.error">
        <thead>
          <tr>
            <th>PO ID</th>
            <th>Company Name</th>
            <th>Date Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredPurchaseOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.companyName }}</td>
            <td>{{ order.dateCreated }}</td>
            <td>
              <VButton
                variant="primary"
                size="sm"
                @click="goToDetail(order.id)"
              >
                View
              </VButton>
              <VButton
                variant="delete"
                size="sm"
                @click="deleteOrder(order.id)"
              >
                Delete
              </VButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="actions">
        <!-- Example: a button to go to create new purchase order page -->
        <VButton @click="goToCreate" size="md">
          + Create Purchase Order
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import VNavbar from '../../../components/VNavbar.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'

const purchaseOrderStore = usePurchaseOrderStore()
const authStore = useAuthStore()
const router = useRouter()

const searchTerm = ref('')
const title = ref({ Marketing: '/marketing' })
const submodules = ref({
  'Purchase Order': '/marketing/purchase-order',
  'Final Report': '/marketing/final-report',
  Klien: '/marketing/client',
})

// On mount, fetch the list
onMounted(async () => {
  if (!authStore.token) {
    // Optionally handle no auth token
    return
  }
  await purchaseOrderStore.fetchAll(authStore.token)
})

// Computed for basic local filtering
const filteredPurchaseOrders = computed(() => {
  if (!searchTerm.value) {
    return purchaseOrderStore.purchaseOrders
  }
  return purchaseOrderStore.purchaseOrders.filter(order =>
    order.companyName.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

function searchPurchaseOrders() {
  // If you want a local search, it's already done by filteredPurchaseOrders.
  // If you want an API-based search, you can implement it in the store.
}

function goToDetail(orderId: number) {
  router.push(`/marketing/purchase-order/${orderId}`)
}

function goToCreate() {
  router.push('/marketing/purchase-order/create')
}

async function deleteOrder(orderId: number) {
  const confirmed = confirm(
    'Are you sure you want to delete this purchase order?',
  )
  if (!confirmed) return

  if (!authStore.token) return
  const success = await purchaseOrderStore.deletePurchaseOrder(
    orderId,
    authStore.token,
  )
  if (success) {
    // Possibly show a toast or just rely on store error state
    window.$toast('success', 'Purchase order deleted!')
  }
}
</script>

<style scoped>
.purchaseorder-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* match ProfileView */
  width: 1200px; /* match ProfileView */
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

.search-bar {
  display: flex;
  gap: 10px;
  margin: 10px 0 20px;
  align-items: flex-end;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th,
td {
  border: 1px solid #f0f0f0;
  padding: 10px;
  text-align: left;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: start;
  gap: 15px;
}
</style>
