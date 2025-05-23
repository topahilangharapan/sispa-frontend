<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useTransactionStore } from '../../stores/transaction.js'
import { useRoute } from 'vue-router'
import CashFlowChart from '../../components/CashFlowChart.vue'
import * as XLSX from 'xlsx';
import { Download, Search } from 'lucide-vue-next'
import type { TransactionInterface } from '../../interfaces/transaction.interface.ts'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({ "Cash Flow": "/finance/cash-flow" });

const accountStore = useAccountStore();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const route = useRoute();
const accountId = Number(route.params.id);
const isLoaded = ref(false);
const activeTab = ref('income');
const isLoading = ref(false);
const searchQuery = ref('');
const filteredTransactions = ref<TransactionInterface[]>([]);

// Pagination state
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = computed(() => filteredTransactions.value.length)
const startRow = computed(() => ((currentPage.value - 1) * perPage.value) + 1)
const endRow = computed(() => Math.min(currentPage.value * perPage.value, totalRows.value))

const displayedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredTransactions.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(totalRows.value / perPage.value))

const displayedPages = computed(() => {
  const pages = []
  const maxPages = 5

  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  } else {
    pages.push(1)
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    if (currentPage.value <= 3) endPage = 4
    if (currentPage.value >= totalPages.value - 2) startPage = totalPages.value - 3

    if (startPage > 2) pages.push('...')
    for (let i = startPage; i <= endPage; i++) pages.push(i)
    if (endPage < totalPages.value - 1) pages.push('...')
    pages.push(totalPages.value)
  }

  return pages
})

// Watch for changes in transaction data
watch(() => transactionStore.transactions, () => {
  filterData()
}, { deep: true })

// Watch for changes in pagination settings
watch([currentPage, perPage], () => {
  // Page change is handled by computed property
})

function updatePerPage(event: Event) {
  const target = event.target as HTMLSelectElement;
  perPage.value = Number(target.value);
  currentPage.value = 1;
}

function goToPage(page: number | string) {
  if (page === '...') return
  currentPage.value = Number(page)
}

const mockCategories = ref([
  { id: "1", name: "Utilities", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "2", name: "Office Supplies", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "3", name: "Salaries", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "4", name: "Marketing", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "5", name: "Travel", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" }
]);

function formatToRupiah(amount: number | undefined): string {
  if (typeof amount !== 'number') return '-';
  return 'Rp ' + amount.toLocaleString('id-ID') + ',-';
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
}

function formatDateTimeToIndo(isoDate: Date | undefined): string {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta', timeZoneName: 'short'
  }).format(date);
}

function formatDateLong(dateInput: string | Date | undefined): string {
  if (!dateInput) return '-';
  let date: Date;
  if (typeof dateInput === 'string') {
    date = new Date(dateInput.replace(' ', 'T'));
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

const handleSearch = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value
  filterData()
  currentPage.value = 1
}

function filterData() {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredTransactions.value = [...transactionStore.transactions]
  } else {
    filteredTransactions.value = transactionStore.transactions.filter(transaction => {
      const categoryText = typeof transaction.category === 'object' && transaction.category?.name
        ? transaction.category.name.toLowerCase()
        : String(transaction.category || '').toLowerCase()

      const accountText = typeof transaction.account === 'object' && transaction.account?.name
        ? transaction.account.name.toLowerCase()
        : String(transaction.account || '').toLowerCase()

      const descriptionText = String(transaction.description || '').toLowerCase()

      const dateText = formatDateLong(transaction.transactionDate).toLowerCase()

      return categoryText.includes(query) ||
        descriptionText.includes(query) ||
        accountText.includes(query) ||
        dateText.includes(query)
    })
  }
}

function refreshData() {
  isLoading.value = true

  Promise.all([
    switchTab(activeTab.value)
  ]).then(() => {
    // Reset search and pagination state
    searchQuery.value = ''
    currentPage.value = 1
    filterData()
  }).finally(() => {
    isLoading.value = false
  })
}

const loadTransactions = async () => {
  await switchTab(activeTab.value);
  isLoaded.value = true;
};

const switchTab = async (tab: string) => {
  activeTab.value = tab;
  currentPage.value = 1;
  searchQuery.value = '';
  const token = authStore.token ?? '';
  if (tab === 'income') {
    await transactionStore.fetchIncomesByAccount(token, String(accountId));
  } else {
    await transactionStore.fetchExpensesByAccount(token, String(accountId));
  }
  filterData();
};

function exportToExcel() {
  const isIncome = activeTab.value === 'income'
  const bankName = accountStore.currentAccount?.bank || 'Unknown'
  const data = filteredTransactions.value.map((t, index) => ({
    No: index + 1,
    Tanggal: formatDateLong(t.transactionDate),
    Kategori: t.category,
    Deskripsi: t.description,
    Jumlah: t.amount,
    Rekening: t.account,
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, isIncome ? 'Pemasukan' : 'Pengeluaran')


  const fileName = `Laporan Keuangan ${bankName} - Transaksi ${isIncome ? 'Pemasukan' : 'Pengeluaran'}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
  const token = authStore.token ?? '';
  await accountStore.getAccountById(token, accountId);
  if (!transactionStore.categories || transactionStore.categories.length === 0) {
    transactionStore.categories = mockCategories.value.map(cat => ({ id: Number(cat.id), name: cat.name }));
  }
  await loadTransactions();
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />
  <div v-if="accountStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>
  <section class="p-6 min-h-screen mt-10">
    <div class="max-w-7xl mx-auto">
      <div class="p-6 space-y-6">

        <!-- Card akun -->
        <div class="bg-gradient-to-b from-red-300 to-red-400 text-white p-4 rounded-xl shadow-md mb-4 flex justify-between items-center">
          <div>
            <p class="text-sm text-brown-100">{{ accountStore.currentAccount?.bank }}</p>
            <p class="font-semibold text-white">{{ accountStore.currentAccount?.no }}</p>
            <p class="text-xs text-white">a.n. {{ accountStore.currentAccount?.name }}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-white">
              {{ formatToRupiah(accountStore.currentAccount?.accountBalance) }}
            </p>
            <p class="text-xs text-brown-100">
              Terakhir diperbarui: {{ formatDateTimeToIndo(accountStore.currentAccount?.lastUpdated) }}
            </p>
          </div>
        </div>

        <!-- Tab switcher -->
        <div class="flex space-x-4 border-b">
          <button @click="switchTab('income')" :class="[ 'px-4 py-2 border-b-2 font-semibold', activeTab === 'income' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
            Pemasukan
          </button>
          <button @click="switchTab('expense')" :class="[ 'px-4 py-2 border-b-2 font-semibold', activeTab === 'expense' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
            Pengeluaran
          </button>
        </div>

        <!-- Chart -->
        <div class="bg-white rounded-xl shadow p-4">
          <CashFlowChart v-if="!accountStore.loading" :key="activeTab" :accountNo="accountStore.currentAccount?.no" :type="activeTab" />
        </div>

        <!-- Search and Controls Section -->
        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <!-- Search Input -->
          <div class="relative">
            <input
              type="text"
              placeholder="Cari transaksi..."
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

          <!-- Export Button -->
          <button @click="exportToExcel"
                  class="flex items-center h-9 justify-center bg-[#5D1D1E] hover:bg-[#8F2527] text-white px-3 py-1.5 rounded-md transition duration-200 shadow-sm">
            <Download class="h-4 w-4 mr-1" />
            <span>Unduh File Excel (.xlsx)</span>
          </button>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table class="w-full table-auto border-collapse">
            <thead>
            <tr class="bg-gray-100 text-left">
              <th class="px-4 py-2">No</th>
              <th class="px-4 py-2">Tanggal</th>
              <th class="px-4 py-2">Kategori</th>
              <th class="px-4 py-2">Deskripsi</th>
              <th class="px-4 py-2 text-right">Jumlah</th>
              <th class="px-4 py-2 text-center">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(transaction, index) in displayedTransactions" :key="transaction.id" class="hover:bg-gray-50 border-b">
              <td class="px-4 py-3">{{ ((currentPage - 1) * perPage) + index + 1 }}</td>
              <td class="px-4 py-3">{{ formatDateLong(transaction.transactionDate) }}</td>
              <td class="px-4 py-3">{{ transaction.category }}</td>
              <td class="px-4 py-3">{{ transaction.description }}</td>
              <td class="px-4 py-3 text-right font-medium" :class="{ 'text-red-600': activeTab === 'expense', 'text-green-600': activeTab === 'income' }">
                {{ formatRupiah(transaction.amount) }}
              </td>
              <td class="px-4 py-3 text-center">
                <RouterLink :to="`/finance/cash-flow/transaction?id=${transaction.id}`">
                  <VButton variant="primary" size="sm">Detail</VButton>
                </RouterLink>
              </td>
            </tr>
            <tr v-if="displayedTransactions.length === 0">
              <td colspan="6" class="text-center py-6 text-black-grey-600">
                {{ searchQuery ? 'Tidak ada transaksi yang sesuai dengan pencarian' : `Tidak ada data ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'} untuk ditampilkan.` }}
              </td>
            </tr>
            </tbody>
          </table>
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
                @change="updatePerPage($event)"
              >
                <option v-for="n in [5, 10, 15, 20, 50]" :key="n" :value="n">{{ n }}</option>
              </select>
              <span>data per halaman</span>
            </div>

            <!-- Pagination info -->
            <div v-if="totalRows > 0" class="text-sm text-[#595959]">
              Menampilkan {{ startRow }} sampai {{ endRow }} dari {{ totalRows }} data
            </div>

            <!-- Pagination controls -->
            <div class="flex items-center space-x-1">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                <span class="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              <button
                v-for="page in displayedPages"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-1.5 border rounded-md transition-colors"
                :class="page === currentPage
                  ? 'bg-[#8F2527] text-white border-[#8F2527]'
                  : 'border-[#ECECEC] text-[#595959] hover:bg-[#F7F8FA]'"
              >
                {{ page }}
              </button>

              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages || totalPages === 0"
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
  </section>
</template>
