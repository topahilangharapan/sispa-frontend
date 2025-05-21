<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import BalancePieChart from '../../components/BalancePieChart.vue'
import { useAuthStore } from '../../stores/auth.ts'
import { useTransactionStore } from '../../stores/transaction.ts'
import { useRouter } from 'vue-router'
import { Plus, ArrowUpRight } from 'lucide-vue-next'
import VButton from '../../components/VButton.vue'

const router = useRouter()

const title = ref({ 'Cash Flow': '/finance/cash-flow' })
const submodules = ref({ "Cash Flow": "/finance/cash-flow" })
const isLoaded = ref(true)

const balanceStore = useTransactionStore()

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

function generateColors(count: number) {
  const baseColors = [
    '#C9A267', // brown-100
    '#3E1011', // red-400
    '#8F2527', // red-200
    '#9C804F', // brown-200
  ]
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length])
  }
  return colors
}

// Bank logos mapping
const bankLogos = {
  'MANDIRI': '/src/assets/logos/mandiri.png',
  'BCA': '/src/assets/logos/bca-logo.png',
  'BNI': '/src/assets/logos/bni-logo.png',
  'BRI': '/src/assets/logos/bri-logo.png',
}

// Sample data for demonstration
const sampleBalances = ref([
  { bankName: 'Mandiri', totalBalance: 15000000, accountNumber: '1234567890' },
  { bankName: 'BCA', totalBalance: 8750000, accountNumber: '0987654321' },
  { bankName: 'BNI', totalBalance: 5200000, accountNumber: '1122334455' },
])

const balances = computed(() => balanceStore.balances || sampleBalances.value)
const colors = computed(() => generateColors(balances.value.length))
const totalBalance = computed(() => {
  return balances.value.reduce((sum, account) => sum + account.totalBalance, 0)
})

function navigateToAccount(accountId: number) {
  router.push(`/finance/cash-flow/account/${accountId}`)
}

function getBankLogo(bankName: string): string {
  return bankLogos[bankName as keyof typeof bankLogos] || '/src/assets/logos/default-bank-logo.png'
}

function openAddTransactionModal() {
  router.push('/finance/cash-flow/transaction/add')
}

onMounted(() => {
  const authStore = useAuthStore()
  const savedAuth = localStorage.getItem('auth')
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }
})
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />
  <VLoading :isDone="isLoaded" />

  <div class="content-container">
    <!-- Top section with total balance and add transaction button -->
    <div class="header-section">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-black-grey-800">Cash Flow Dashboard</h1>
        </div>
        <VButton @click="openAddTransactionModal"
                class="add-transaction-btn flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
          <Plus :size="18" />
          <span>Add Transaction</span>
        </VButton>
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
          <div class="chart-container flex justify-center">
            <BalancePieChart :data="balances" :colors="colors" />
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
      </div>
      <div class="bg-white-300 rounded-lg p-4 text-center text-black-grey-600">
        <!-- Data table will be inserted here -->
        <p class="py-10">Transaction data table component will be placed here</p>
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
