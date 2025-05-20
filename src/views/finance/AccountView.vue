<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useTransactionStore } from '../../stores/transaction.js'
import { useRoute } from 'vue-router'
import { Banknote } from 'lucide-vue-next'
import router from '../../router'
import { DataTable } from 'simple-datatables'
import router from '../../router'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({ "Cash Flow": "/finance/cash-flow" });

const accountStore = useAccountStore();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();
const route = useRoute();
const accountId = Number(route.params.id);
const isLoaded = ref(false);
const activeTab = ref('expense');
const dataTableInstance = ref<DataTable | null>(null);

// Mock categories
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
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short'
  }).format(date);
}


function initDataTable() {
  setTimeout(() => {
    if (document.getElementById('transaction-table')) {
      dataTableInstance.value = new DataTable('#transaction-table', {
        searchable: true,
        sortable: true,
        paging: true,
        perPage: 10,
      });
    }
  }, 100);
}

function formatDateLong(dateInput: string | Date | undefined): string {
  if (!dateInput) return '-';
  let date: Date;
  if (typeof dateInput === 'string') {
    // Replace the first space with 'T' to make it ISO 8601 compatible
    date = new Date(dateInput.replace(' ', 'T'));
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

const loadTransactions = async () => {
  const token = authStore.token ?? '';
  await transactionStore.fetchExpensesByAccount(token, String(accountId));
  isLoaded.value = true;
};

const switchTab = async (tab: string) => {
  activeTab.value = tab;

  const token = authStore.token ?? '';
  if (tab === 'income') {
    //await transactionStore.fetchIncomesByAccount(token, String(accountId));
  } else {
    await transactionStore.fetchExpensesByAccount(token, String(accountId));
  }

  if (dataTableInstance.value) {
    dataTableInstance.value.destroy();
  }

  initDataTable();
};


onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  await accountStore.getAccountById(token, accountId);

  if (!transactionStore.categories || transactionStore.categories.length === 0) {
    transactionStore.categories = mockCategories.value;
  }

  await loadTransactions();
  initDataTable();
});

function viewTransactionDetail(transactionId: string) {
  router.push(`/finance/transaction/${transactionId}`);
}
</script>


<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>

  <div v-if="accountStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <section class="p-6 min-h-screen mt-10">
    <div class="max-w-7xl mx-auto">
      <div class="p-6 space-y-6">

        <!-- Card akun -->
        <div class="bg-white rounded-xl shadow p-6 flex items-center space-x-6">
          <!-- Icon -->
          <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <Banknote class="w-7 h-7 text-blue-600" />
          </div>

          <!-- Info akun -->
          <div>
            <p class="text-sm text-gray-500">{{ accountStore.currentAccount?.bank }}</p>
            <p class="text-lg font-semibold text-gray-800">{{ accountStore.currentAccount?.no }}</p>
            <p class="text-base text-gray-600">a.n. {{ accountStore.currentAccount?.name }}</p>
          </div>

          <!-- Balance dan waktu update -->
          <div class="ml-auto text-right">
            <p class="text-2xl font-bold text-brown-400">
              {{ formatToRupiah(accountStore.currentAccount?.balance) }}
            </p>
            <p class="text-sm text-gray-400">
              Terakhir diperbarui:
              {{ formatDateTimeToIndo(accountStore.currentAccount?.lastUpdated) }}
            </p>
          </div>
        </div>

        <!-- Tab switcher -->
        <div class="flex space-x-4 border-b">
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
        </div>


        <!-- Chart -->
        <div class="bg-white rounded-xl shadow p-4">
          <canvas id="lineChart" class="w-full h-40"></canvas>
        </div>

        <!-- Table -->
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
                <td class="px-4 py-3">{{ formatDateLong(transaction.createdAt) }}</td>
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
    </div>
  </section>
</template>


