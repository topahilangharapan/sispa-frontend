<script setup lang="ts">
import VNavbar from '../../../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VButton from '../../../components/VButton.vue'
import { useItemStore } from '../../../stores/item.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { Search, Package, Plus } from 'lucide-vue-next'
import type { ItemInterface } from '../../../interfaces/item.interface.ts'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
});
const itemStore = useItemStore()
const authStore = useAuthStore()
const searchQuery = ref('')
const isLoading = ref(true)

// Pagination and filtering state
const filteredData = ref<ItemInterface[]>([])
const displayedItems = ref<ItemInterface[]>([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)

const handleSearch = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value
  filterData()
  currentPage.value = 1
  updateDisplayedData()
};

function filterData() {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredData.value = [...itemStore.items]
  } else {
    filteredData.value = itemStore.items.filter(item => {
      return item.id?.toString().toLowerCase().includes(query) ||
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
    })
  }

  totalRows.value = filteredData.value.length
}

function updateDisplayedData() {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  const dataSource = searchQuery.value ? filteredData.value : itemStore.items
  displayedItems.value = dataSource.slice(start, end)
}

function refreshData() {
  isLoading.value = true;
  const token = authStore.token ?? '';
  itemStore.getAllItems(token).finally(() => {
    searchQuery.value = '';
    currentPage.value = 1;
    filterData();
    updateDisplayedData();
    isLoading.value = false;
  });
}

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  try {
    isLoading.value = true;
    const token = authStore.token ?? '';
    await itemStore.getAllItems(token);

    // Initialize data for pagination
    filteredData.value = [...itemStore.items];
    totalRows.value = itemStore.items.length;
    updateDisplayedData();

    isLoading.value = false;
  } catch (error) {
    console.error("Failed to fetch items:", error);
    isLoading.value = false;
  }
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div class="p-4 md:p-8 min-h-screen">
    <div class="max-w-full mx-auto mt-14">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-black-grey-800">Item Dashboard</h1>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECECEC] transition-all duration-300 hover:shadow-xl">
        <!-- Card Header -->
        <div class="p-5 border-b border-[#ECECEC] bg-gradient-to-r from-white to-[#FCFAFA]">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center">
              <div class="p-2 bg-[#FEF6F6] rounded-lg mr-3">
                <Package class="h-5 w-5 text-[#8F2527]" />
              </div>
              <h2 class="text-xl font-bold text-[#2E2E2E]">Daftar Item</h2>
            </div>

            <div class="flex flex-col md:flex-row gap-3">
              <!-- Search Input -->
              <div class="relative">
                <input
                  type="text"
                  placeholder="Cari item..."
                  v-model="searchQuery"
                  @input="handleSearch"
                  class="pl-10 pr-4 py-2.5 border border-[#D8D8D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B32225] focus:border-transparent w-full md:w-64 text-[#595959] bg-[#FCFCFC] transition-all duration-200"
                />
                <Search class="h-4 w-4 text-[#838383] absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <!-- Refresh Button -->
              <button
                @click="refreshData"
                class="px-4 py-2.5 rounded-lg border border-[#D8D8D8] bg-white hover:bg-gray-50 text-[#595959] flex items-center justify-center transition duration-200"
                :class="{'animate-spin': isLoading}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
              </button>

              <!-- Add Button -->
              <RouterLink :to="`/purchasing/item/create`">
                <VButton
                  variant="primary"
                  class="px-4 py-2.5 rounded-lg flex items-center justify-center transition duration-200 shadow-sm">
                  <Plus class="h-4 w-4 mr-2" />
                  Tambah Item
                </VButton>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8F2527]"></div>
          <span class="ml-3 text-[#595959]">Memuat data...</span>
        </div>

        <!-- Table Content -->
        <div v-else class="overflow-x-auto">
          <table id="item-table" class="w-full">
            <thead>
            <tr class="bg-[#F7F8FA] text-[#2E2E2E]">
              <th class="px-6 py-4 text-center font-semibold">No.</th>
              <th class="px-6 py-4 text-left font-semibold">ID</th>
              <th class="px-6 py-4 text-center font-semibold">Nama</th>
              <th class="px-6 py-4 text-center font-semibold">Kategori</th>
              <th class="px-6 py-4 text-center font-semibold">Status</th>
              <th class="px-6 py-4 text-center font-semibold">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in displayedItems" :key="item.id"
                class="border-t border-[#ECECEC] hover:bg-[#F7F8FA] transition-all duration-150">
              <td class="px-6 py-4 text-center text-[#595959] font-medium">
                {{ ((currentPage - 1) * perPage) + index + 1 }}
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center">
                  <span class="font-medium text-[#2E2E2E]">{{ item.id }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-left font-medium text-[#2E2E2E]">
                <div class="line-clamp-1 max-w-xs">{{ item.title }}</div>
              </td>
              <td class="px-6 py-4 text-center text-[#595959]">{{ item.category }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': item.status === 'TERSEDIA',
                    'bg-pink-100 text-red-600': item.status === 'TIDAK TERSEDIA',
                    'bg-gray-200 text-gray-700': item.status === 'DIPERBAIKI'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center justify-center">
                  <RouterLink :to="`/purchasing/item/${item.id}`">
                    <VButton
                      variant="primary"
                      class="flex items-center h-9 justify-center bg-[#5D1D1E] hover:bg-[#8F2527] text-brown-400 px-3 py-1.5 rounded-md transition duration-200 shadow-sm">
                      Detail
                    </VButton>
                  </RouterLink>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && displayedItems.length === 0" class="px-6 py-16 text-center">
          <div class="mx-auto max-w-md p-6 rounded-xl bg-[#F7F8FA] border border-dashed border-[#D8D8D8]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-[#B32225]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p class="text-lg font-medium text-[#2E2E2E]">{{ searchQuery ? 'Tidak ada data item yang sesuai' : 'Belum ada data item' }}</p>
            <p class="mt-1 text-[#595959]">{{ searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda' : 'Klik tombol "Tambah Item" untuk menambahkan item baru' }}</p>
            <RouterLink v-if="!searchQuery" :to="`/purchasing/item/create`">
              <VButton
                variant="primary"
                class="mt-4 px-4 py-2 rounded-lg flex items-center justify-center mx-auto">
                <Plus class="h-4 w-4 mr-2" />
                Tambah Item Baru
              </VButton>
            </RouterLink>
            <button v-else @click="() => { searchQuery = ''; handleSearch({ target: { value: '' } } as unknown as Event); }"
                    class="mt-4 px-4 py-2 rounded-lg flex items-center justify-center mx-auto bg-[#8F2527] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Reset Pencarian
            </button>
          </div>
        </div>

        <!-- Custom Pagination in Table Footer -->
        <div class="p-4 border-t border-[#ECECEC] bg-[#FCFCFC]">
          <div class="flex flex-col md:flex-row items-center justify-between gap-3">
            <!-- Items per page selector -->
            <div class="flex items-center space-x-2 text-sm text-[#595959]">
              <span>Tampilkan</span>
              <select
                class="px-3 py-1.5 border border-[#D8D8D8] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#B32225] focus:border-transparent"
                v-model="perPage"
                @change="(event) => { perPage = parseInt((event.target as HTMLSelectElement).value); currentPage = 1; updateDisplayedData(); }"
              >
                <option v-for="n in [5, 10, 15, 20, 50]" :key="n" :value="n">{{ n }}</option>
              </select>
              <span>data per halaman</span>
            </div>

            <!-- Pagination info -->
            <div v-if="totalRows > 0" class="text-sm text-[#595959]">
              Menampilkan {{ ((currentPage - 1) * perPage) + 1 }} sampai {{ Math.min(currentPage * perPage, totalRows) }} dari {{ totalRows }} data
            </div>

            <!-- Pagination controls -->
            <div class="flex items-center space-x-1">
              <button
                @click="currentPage--; updateDisplayedData()"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                <span class="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              <button
                v-for="page in Math.ceil(totalRows / perPage)"
                :key="page"
                @click="currentPage = page; updateDisplayedData()"
                class="px-3 py-1.5 border rounded-md transition-colors"
                :class="page === currentPage
                  ? 'bg-[#8F2527] text-white border-[#8F2527]'
                  : 'border-[#ECECEC] text-[#595959] hover:bg-[#F7F8FA]'"
              >
                {{ page }}
              </button>

              <button
                @click="currentPage++; updateDisplayedData()"
                :disabled="currentPage === Math.ceil(totalRows / perPage) || Math.ceil(totalRows / perPage) === 0"
                class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                <span class="sr-only">Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
