<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useTransactionStore } from '../../stores/transaction.js'
import { useRoute } from 'vue-router'
import { DataTable } from 'simple-datatables'
import router from '../../router'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({
  "Cash Flow": "/finance/cash-flow"
});

const accountStore = useAccountStore();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const route = useRoute();
const accountId = Number(route.params.id);
const isLoaded = ref(false);
const activeTab = ref('expense'); // Default to expense tab
const dataTableInstance = ref<DataTable | null>(null);

// Date filtering
const filters = reactive({
  startDate: '',
  endDate: '',
  category: ''
});

// Mock categories for development and testing
const mockCategories = ref([
  { id: "1", name: "Utilities", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "2", name: "Office Supplies", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "3", name: "Salaries", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "4", name: "Marketing", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" },
  { id: "5", name: "Travel", createdAt: new Date(), updatedAt: new Date(), createdBy: "mock", updatedBy: "mock" }
]);

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
}

function formatDate(dateString: string | Date) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

const handleSearch = (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value;
  if (dataTableInstance.value) {
    dataTableInstance.value.search(searchValue);
  }
};

const switchTab = (tab: string) => {
  activeTab.value = tab;
  // Refresh data table after tab switch
  if (dataTableInstance.value) {
    dataTableInstance.value.destroy();
  }
  loadTransactions().then(() => {
    initDataTable();
  });
};

function initDataTable() {
  // Allow some time for the DOM to update
  setTimeout(() => {
    if (document.getElementById('transaction-table') && typeof DataTable !== 'undefined') {
      dataTableInstance.value = new DataTable('#transaction-table', {
        searchable: true,
        sortable: true,
        paging: true,
        perPage: 10,
      });
    }
  }, 100);
}

const applyFilters = async () => {
  await loadTransactions();
  if (dataTableInstance.value) {
    dataTableInstance.value.destroy();
    initDataTable();
  }
};

const bankLogos: { [key: string]: string } = {
  'MANDIRI': '/src/assets/logos/mandiri.png',
  'BCA': '/src/assets/logos/bca-logo.png',
  'BNI': '/src/assets/logos/bni-logo.png',
  'BRI': '/src/assets/logos/bri-logo.png',
};

function getBankLogo(bankName: string): string {
  return bankLogos[bankName] || '/src/assets/logos/default-bank-logo.png';
}

const loadTransactions = async () => {
  const token = authStore.token ?? '';
  await transactionStore.fetchExpensesByAccount(token, String(accountId));
  isLoaded.value = true;
};

// function formatToRupiah(amount: number | undefined): string {
//   if (typeof amount !== 'number') return '-'
//   return 'Rp' + amount.toLocaleString('id-ID') + ',-'
// }

// function formatDateTimeToIndo(isoDate: Date | undefined): string {
//   if (!isoDate) return '-';

//   const date = new Date(isoDate);

//   return new Intl.DateTimeFormat('id-ID', {
//     day: '2-digit',
//     month: 'long',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     timeZone: 'Asia/Jakarta',
//     timeZoneName: 'short'
//   }).format(date);
// }

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  
  // Load account data
  await accountStore.getAccountById(token, accountId);
  
  // If there are no categories, set mock categories for development
  if (!transactionStore.categories || transactionStore.categories.length === 0) {
    transactionStore.categories = mockCategories.value;
  }
  
  // Load transactions
  await loadTransactions();
  
  // Initialize datatable
  initDataTable();
});

// View transaction detail
function viewTransactionDetail(transactionId: string) {
  router.push(`/finance/transaction/${transactionId}`);
}
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="accountStore.loading || transactionStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div class="p-6 space-y-6">
    <!-- Account Info Card -->
    <div class="bg-white rounded-xl shadow p-6 flex items-center space-x-4 mt-8">
      <div class="bank-logo w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <img
          v-if="accountStore.currentAccount?.bank"
          :src="getBankLogo(accountStore.currentAccount.bank)"
          alt="Bank Logo"
          class="w-12 h-12 object-contain"
        />
      </div>
      <div class="flex-1">
        <h2 class="text-xl font-bold">{{ accountStore.currentAccount?.bank }}</h2>
        <p class="text-lg">{{ accountStore.currentAccount?.no }}</p>
        <p class="text-gray-600">{{ accountStore.currentAccount?.name }}</p>
      </div>
      <div class="text-right">
        <p class="text-gray-600">Saldo Saat Ini</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatRupiah(accountStore.currentAccount?.balance || 0) }}</p>
      </div>
    </div>

    <!-- Tab switcher -->
    <div class="flex space-x-4 border-b">
      <button 
        @click="switchTab('expense')" 
        :class="[
          'px-4 py-2 border-b-2 font-semibold',
          activeTab === 'expense' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        Pengeluaran
      </button>
      <button 
        @click="switchTab('income')" 
        :class="[
          'px-4 py-2 border-b-2 font-semibold',
          activeTab === 'income' 
            ? 'border-blue-500 text-blue-600' 
            : 'border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        Pemasukan
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow p-4">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
          <input 
            type="date" 
            v-model="filters.startDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input 
            type="date" 
            v-model="filters.endDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select 
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <!-- Assume you have categories in your store -->
            <option v-for="category in transactionStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <VButton @click="applyFilters" variant="primary" size="md">
            Terapkan Filter
          </VButton>
        </div>
        <div class="ml-auto">
          <input
            type="text"
            placeholder="Cari transaksi..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <table id="transaction-table" class="w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">No.</th>
            <th class="px-4 py-2 text-left">Tanggal</th>
            <th class="px-4 py-2 text-left">Kategori</th>
            <th class="px-4 py-2 text-left">Deskripsi</th>
            <th class="px-4 py-2 text-right">Jumlah</th>
            <th class="px-4 py-2 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(transaction, index) in transactionStore.transactions" 
            :key="transaction.id" 
            class="hover:bg-gray-50 border-b"
          >
            <td class="px-4 py-3">{{ index + 1 }}</td>
            <td class="px-4 py-3">{{ formatDate(transaction.createdAt) }}</td>
            <td class="px-4 py-3">{{ transaction.category }}</td>
            <td class="px-4 py-3">{{ transaction.description }}</td>
            <td class="px-4 py-3 text-right font-medium" 
                :class="{'text-red-600': activeTab === 'expense', 'text-green-600': activeTab === 'income'}">
              {{ formatRupiah(transaction.amount) }}
            </td>
            <td class="px-4 py-3 text-center">
              <VButton 
                variant="primary" 
                size="sm" 
                @click="viewTransactionDetail(transaction.id)"
              >
                Detail
              </VButton>
            </td>
          </tr>
          <tr v-if="transactionStore.transactions.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">
              Tidak ada data {{ activeTab === 'expense' ? 'pengeluaran' : 'pemasukan' }} untuk ditampilkan.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bank-logo img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>