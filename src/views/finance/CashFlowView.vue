<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import BalancePieChart from '../../components/BalancePieChart.vue'
import { useAuthStore } from '../../stores/auth.ts'
import { useTransactionStore } from '../../stores/transaction.ts'
import { useRouter } from 'vue-router'
import { Plus, ArrowUpRight, Download, Search } from 'lucide-vue-next'
import VButton from '../../components/VButton.vue'
import * as XLSX from 'xlsx'
import type { TransactionInterface } from '../../interfaces/transaction.interface.ts'

const authStore = useAuthStore()
const balanceStore = useTransactionStore()
const currentPage = ref(1)
const perPage = ref(10)
const activeTab = ref('income')
const isLoaded = ref(false)
const isLoading = ref(false)
const searchQuery = ref('')
const filteredTransactions = ref<TransactionInterface[]>([]);
const router = useRouter()

const title = ref({ 'Cash Flow': '/finance/cash-flow' })
const submodules = ref({ 'Cash Flow': '/finance/cash-flow' })

const totalRows = computed(() => filteredTransactions.value.length)
const totalPages = computed(() => Math.ceil(totalRows.value / perPage.value))
const startRow = computed(() => ((currentPage.value - 1) * perPage.value) + 1)
const endRow = computed(() => Math.min(currentPage.value * perPage.value, totalRows.value))
const displayedTransactions = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredTransactions.value.slice(start, start + perPage.value)
})

const balances = computed(() => balanceStore.balances || [])
const totalBalance = computed(() => balances.value.reduce((sum, acc) => sum + acc.totalBalance, 0))

const generateColors = (count: number) => {
  const baseColors = ['#C9A267', '#3E1011', '#8F2527', '#9C804F']
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length])
}

const colors = computed(() => generateColors(balances.value.length))

const bankLogos: Record<string, string> = {
  MANDIRI: '/src/assets/logos/mandiri.png',
  BCA: '/src/assets/logos/bca-logo.png',
  BNI: '/src/assets/logos/bni-logo.png',
  BRI: '/src/assets/logos/bri-logo.png',
}

// Watch for changes in transaction data
watch(() => balanceStore.transactions, () => {
  filterData()
}, { deep: true })

// Watch for changes in pagination settings
watch([currentPage, perPage], () => {
  // Page change is handled by computed property
})

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

function formatDateLong(dateInput: string | Date | undefined): string {
  if (!dateInput) return '-'
  const date = typeof dateInput === 'string' ? new Date(dateInput.replace(' ', 'T')) : new Date(dateInput)
  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function getBankLogo(bankName: string) {
  return bankLogos[bankName.toUpperCase()] || '/src/assets/logos/default-bank-logo.png'
}

function navigateToAccount(accountId: number) {
  router.push(`/finance/cash-flow/account/${accountId}`)
}

function openAddTransactionModal() {
  router.push('/finance/cash-flow/transaction/add')
}

function exportToExcel() {
  const isIncome = activeTab.value === 'income'
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

  const fileName = `Laporan Keuangan - Transaksi ${isIncome ? 'Pemasukan' : 'Pengeluaran'}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

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

function goToPage(page: number | string) {
  if (page === '...') return
  currentPage.value = Number(page)
}

function updatePerPage(event: Event) {
  const target = event.target as HTMLSelectElement;
  perPage.value = Number(target.value);
  currentPage.value = 1;
}

const handleSearch = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value
  filterData()
  currentPage.value = 1
}

function filterData() {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredTransactions.value = [...balanceStore.transactions]
  } else {
    filteredTransactions.value = balanceStore.transactions.filter(transaction => {
      // Handle category field - check if it's an object with name or just a string
      const categoryText = typeof transaction.category === 'object' && transaction.category?.name
        ? transaction.category.name.toLowerCase()
        : String(transaction.category || '').toLowerCase()

      // Handle account field - check if it's an object with name or just a string
      const accountText = typeof transaction.account === 'object' && transaction.account?.name
        ? transaction.account.name.toLowerCase()
        : String(transaction.account || '').toLowerCase()

      // Handle description field
      const descriptionText = String(transaction.description || '').toLowerCase()

      // Handle date field
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
  const token = authStore.token ?? ''

  Promise.all([
    balanceStore.fetchAllIncomes(token),
    balanceStore.fetchAllExpenses(token)
  ]).then(() => {
    // Reset search and pagination state
    searchQuery.value = ''
    currentPage.value = 1
    filterData()
  }).finally(() => {
    isLoading.value = false
  })
}

const switchTab = async (tab: string) => {
  activeTab.value = tab
  currentPage.value = 1
  searchQuery.value = ''
  const token = authStore.token ?? ''
  if (tab === 'income') {
    await balanceStore.fetchAllIncomes(token)
  } else {
    await balanceStore.fetchAllExpenses(token)
  }
  filterData()
}

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')
  if (savedAuth) authStore.$patch(JSON.parse(savedAuth))
  await switchTab(activeTab.value)
  isLoaded.value = true
})
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />
  <VLoading :isDone="isLoaded" />

  <div class="content-container">
    <!-- Top section with total balance -->
    <div class="header-section">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-black-grey-800">Cash Flow Dashboard</h1>
        </div>
      </div>
      <div class="total-balance-card bg-red-400 text-white-100 p-6 rounded-xl shadow-md mb-6">
        <p class="text-white-400 mb-2">Total Balance</p>
        <h2 class="text-3xl font-bold">{{ formatRupiah(totalBalance) }}</h2>
      </div>
    </div>

    <!-- First row: two columns layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      <!-- Left column: Pie chart -->
      <div class="lg:col-span-5">
        <div class="chart-card bg-white-200 rounded-xl shadow-md p-6">
          <h3 class="text-lg font-medium text-black-grey-700 mb-4">Balance Distribution</h3>
          <div class="chart-container flex flex-row justify-center items-start gap-6">
            <div class="pie w-[280px] h-[280px] flex-shrink-0">
              <BalancePieChart :data="balances" :colors="colors" />
            </div>
            <div class="legend space-y-2 pt-4">
              <div
                v-for="(item, index) in balances"
                :key="index"
                class="flex items-center gap-2"
              >
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: colors[index] }"
                ></div>
                <span class="text-sm text-black-grey-700">{{ item.bankName }}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Right column: Bank cards -->
      <div class="lg:col-span-7">
        <div class="bank-accounts-card bg-white-200 rounded-xl shadow-md p-6">
          <h3 class="text-lg font-medium text-black-grey-700 mb-4">Bank Accounts</h3>
          <div class="bank-cards-container space-y-3">
            <div
              v-for="(item, index) in balances"
              :key="index"
              class="bank-card bg-white-300 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
              :style="{ borderLeftColor: colors[index] }"
              @click="navigateToAccount(item.accountId)"
            >
              <div class="flex items-center gap-4">
                <div class="bank-logo bg-white-200 p-2 rounded-lg">
                  <img :src="getBankLogo(item.bankName)" class="h-8 w-auto object-contain" />
                </div>
                <div>
                  <p class="font-medium text-black-grey-800">{{ item.bankName }}</p>
                  <p class="text-sm text-black-grey-600">{{ item.accountNumber }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="font-bold text-black-grey-800">{{ formatRupiah(item.totalBalance) }}</p>
                </div>
                <ArrowUpRight :size="16" class="text-brown-200" />
              </div>
            </div>
            <div v-if="balances.length === 0" class="empty-state text-center py-8 text-black-grey-600">
              No bank accounts available.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Second row: Data table section -->
    <div class="transactions-section bg-white-200 rounded-xl shadow-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-black-grey-700">Transactions</h3>
        <button @click="exportToExcel"
                class="flex items-center h-9 justify-center bg-[#5D1D1E] hover:bg-[#8F2527] text-white px-3 py-1.5 rounded-md transition duration-200 shadow-sm">
          <Download class="h-4 w-4 mr-1" />
          <span>Unduh File Excel (.xlsx)</span>
        </button>
      </div>
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

        <!-- Add Button -->
        <VButton @click="openAddTransactionModal"
                 class="add-transaction-btn flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
          <Plus :size="18" />
          <span>Tambah Transaction</span>
        </VButton>
      </div>

      <!-- Tab switcher -->
      <div class="flex space-x-4 border-b mb-4">
        <button @click="switchTab('income')" :class="[ 'px-4 py-2 border-b-2 font-semibold', activeTab === 'income' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          Pemasukan
        </button>
        <button @click="switchTab('expense')" :class="[ 'px-4 py-2 border-b-2 font-semibold', activeTab === 'expense' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          Pengeluaran
        </button>
      </div>
      <div class="bg-white-300 rounded-lg p-4 text-center text-black-grey-600">
        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left text-black-grey-700">
            <thead class="bg-white-300 text-black-grey-600 uppercase text-xs">
            <tr>
              <th class="px-4 py-2">No</th>
              <th class="px-4 py-2">Tanggal</th>
              <th class="px-4 py-2">Kategori</th>
              <th class="px-4 py-2">Deskripsi</th>
              <th class="px-4 py-2">Jumlah</th>
              <th class="px-4 py-2">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(transaction, index) in displayedTransactions" :key="index" class="border-b bg-white hover:bg-gray-50">
              <td class="px-4 py-2">{{ ((currentPage - 1) * perPage) + index + 1 }}</td>
              <td class="px-4 py-2">{{ formatDateLong(transaction.transactionDate) }}</td>
              <td class="px-4 py-2">{{
                  typeof transaction.category === 'object' && transaction.category?.name
                    ? transaction.category.name
                    : transaction.category
                }}</td>
              <td class="px-4 py-2">{{ transaction.description }}</td>
              <td class="px-4 py-2">{{ formatRupiah(transaction.amount) }}</td>
              <td class="px-4 py-2">
                <div class="ml-4">
                  <RouterLink :to="`/finance/cash-flow/transaction?id=${transaction.id}`">
                    <VButton variant="primary" size="sm">Detail</VButton>
                  </RouterLink>
                </div>
              </td>
            </tr>
            <tr v-if="displayedTransactions.length === 0">
              <td colspan="6" class="text-center py-6 text-black-grey-600">
                {{ searchQuery ? 'Tidak ada transaksi yang sesuai dengan pencarian' : 'No transactions found.' }}
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
  </div>
</template>

<style scoped>
.content-container {
  min-height: 100vh;
  padding: 2rem;
  padding-top: 5rem;
}

.chart-container {
  height: 280px;
  width: 280px;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .chart-container {
    height: 220px;
    width: 220px;
  }
}

@media (max-width: 640px) {
  .content-container {
    padding: 1rem;
    padding-top: 4.5rem;
  }
}
</style>
