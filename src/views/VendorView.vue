<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../components/VLoading.vue'
import VButton from '../components/VButton.vue'
import { useVendorStore } from '../stores/vendor.ts'
import { useAuthStore } from '../stores/auth.ts'
import { DataTable } from 'simple-datatables'

const title = ref("Vendor");
const submodules = ref([""]);
const vendorStore = useVendorStore()
const authStore = useAuthStore()

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  await vendorStore.getVendors(authStore.token)
  if (
    document.getElementById('default-table') &&
    typeof DataTable != 'undefined'
  ) {
    new DataTable('#default-table', {
      searchable: true,
      sortable: true,
      paging: true,
    })
  }
});

const reloadTable = async () => {
  if (
    document.getElementById('default-table') &&
    typeof DataTable != 'undefined'
  ) {
    new DataTable('#default-table', {
      searchable: false,
      sortable: true,
      paging: true,
    })
  }
}
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="vendorStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div class="p-8 bg-white-100 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-screen-xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg w-full">
        <div class="flex items-center justify-between mb-2">
        <h2 class="heading-2">Daftar Vendor</h2>
        <div class="flex space-x-2"> 
          <RouterLink :to="`/vendor/add`">
            <VButton variant="primary" size="md">Add</VButton>
          </RouterLink>
        </div>
      </div>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <main class="w-full overflow-x-auto">
          <table id="default-table" class="w-full">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-center">No</th>
                <th class="px-4 py-2 text-left">ID Vendor</th>
                <th class="px-4 py-2 text-left">Nama</th>
                <th class="px-4 py-2 text-left">Layanan</th>
                <th class="px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vendor, index) in vendorStore.vendors" :key="vendor.id" class="hover:bg-gray-50">
                <td class="px-4 py-2 text-center">{{ index + 1 }}</td>
                <td class="px-4 py-2 text-left">{{ vendor.id }}</td>
                <td class="px-4 py-2 text-left">{{ vendor.name }}</td>
                <td class="px-4 py-2 text-left">{{ vendor.service }}</td>
                <td class="px-4 py-2 text-center">
                  <RouterLink :to="`/vendor/${vendor.id}`">
                    <VButton variant="primary" size="sm">Detail</VButton>
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  </div>
</template>

