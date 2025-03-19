<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '../../stores/invoice.ts'
import { useAuthStore } from '../../stores/auth.ts'
import VNavbar from '../../components/VNavbar.vue'
import VButton from '../../components/VButton.vue'
import { DataTable } from 'simple-datatables'

const title = ref({ 'Finance': '/finance' });
const submodules = ref({ "Invoice": "/finance/invoice" });
const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const router = useRouter()
const searchTerm = ref('')
const dataTableInstance = ref<DataTable | null>(null);

onMounted(async () => {
  if (!authStore.token) return
  await invoiceStore.fetchAll(authStore.token)

  if (document.getElementById('invoice-table') && typeof DataTable !== 'undefined') {
    dataTableInstance.value = new DataTable('#invoice-table', {
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
  router.push(`/finance/invoice/${invId}`)
}

async function deleteInvoice(invId: number) {
  const confirmed = confirm('Apakah Anda yakin akan menghapus invoice ini?')
  if (!confirmed) return
  if (!authStore.token) return
  const success = await invoiceStore.deleteInvoice(invId, authStore.token)
  if (success) {
    window.$toast('success', 'Invoice berhasil dihapus!')
  }
}
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />
  <div class="p-8 bg-white min-h-screen flex flex-col items-center">
    <div class="w-full max-w-screen-xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg w-full">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Daftar Invoice</h2>
          <div class="flex space-x-2">
            <input
              type="text"
              placeholder="Cari invoice..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch"
            />
            <VButton @click="() => router.push('/finance/invoice/create')" variant="primary" size="md">
              + Tambah Invoice
            </VButton>
          </div>
        </div>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <main class="w-full overflow-x-auto">
          <table id="invoice-table" class="w-full">
            <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left">No.</th>
              <th class="px-4 py-2 text-left">ID Invoice</th>
              <th class="px-4 py-2 text-left">ID PO</th>
              <th class="px-4 py-2 text-left">Nama Acara</th>
              <th class="px-4 py-2 text-left">Tanggal Dibuat</th>
              <th class="px-4 py-2 text-center">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(inv, index) in invoiceStore.invoices" :key="inv.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 text-center">{{ index + 1 }}</td>
              <td class="px-4 py-2 text-left">{{ inv.noInvoice }}</td>
              <td class="px-4 py-2 text-left">{{ inv.noPo }}</td>
              <td class="px-4 py-2 text-left">{{ inv.event }}</td>
              <td class="px-4 py-2 text-left">{{ inv.dateCreated }}</td>
              <td class="px-4 py-2 text-center">
                <VButton variant="primary" size="sm" @click="goToDetail(inv.id)">Detail</VButton>
                <VButton variant="danger" size="sm" @click="deleteInvoice(inv.id)">Delete</VButton>
              </td>
            </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  </div>
</template>
