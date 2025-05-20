<script setup lang="ts">
import VNavbar from '../../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useVendorStore } from '../../stores/vendor.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { DataTable } from 'simple-datatables'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
});
const vendorStore = useVendorStore()
const authStore = useAuthStore()
const dataTableInstance = ref<DataTable | null>(null);

const handleSearch = (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value;
  if (dataTableInstance.value) {
    dataTableInstance.value.search(searchValue);
  }
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  await vendorStore.getVendors(token);
  if (
    document.getElementById('default-table') &&
    typeof DataTable != 'undefined'
  ) {
    dataTableInstance.value = new DataTable('#default-table', {
      searchable: false,
      sortable: true,
      paging: true,
    })
  }
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="vendorStore.loading">
    <VLoading :isDone="!vendorStore.loading" />
  </div>

  <div class="p-8 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-screen-xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg w-full">
        <div class="flex items-center justify-between mb-2">
        <h2 class="heading-2">Daftar Vendor</h2>
        <div class="flex space-x-2">
          <div class="relative">
            <input
              type="text"
              placeholder="Cari vendor..."
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
          <RouterLink :to="`/purchasing/vendor/add`">
            <VButton variant="primary" size="md">+ Tambah Vendor</VButton>
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
                  <RouterLink :to="`/purchasing/vendor/${vendor.id}`">
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

