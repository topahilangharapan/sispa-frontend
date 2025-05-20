<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import VNavbar from '../components/VNavbar.vue'
import VLoading from '../components/VLoading.vue'
import BalancePieChart from '../components/BalancePieChart.vue'
import { useAuthStore } from '../stores/auth.ts'
import { useTransactionStore } from '../stores/transaction.ts'
import { useRouter } from 'vue-router'

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
    '#C9A267',
    '#3E1011',
    '#8F2527',
    '#725D39',
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
  { bankName: 'Mandiri', totalBalance: 15000000 },
  { bankName: 'BCA', totalBalance: 8750000 },
  { bankName: 'BNI', totalBalance: 5200000 },
])

const balances = computed(() => balanceStore.balances || sampleBalances.value)
const colors = computed(() => generateColors(balances.value.length))

function navigateToAccount(accountId: number) {
  router.push(`/finance/account/${accountId}`)
}
function getBankLogo(bankName: string): string {
  return bankLogos[bankName as keyof typeof bankLogos] || '/src/assets/logos/default-bank-logo.png'
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
    <h2>Balance Per Bank</h2>
    <div class="dashboard-layout">
      <div class="chart-wrapper">
        <div class="chart-container">
          <BalancePieChart :data="balances" :colors="colors" />
        </div>
      </div>

      <div class="banks-container">
        <div
          class="bank-card"
          v-for="(item, index) in balances"
          :key="index"
          @click="navigateToAccount(item.accountId)"
        >
          <div class="bank-logo">
            <img :src="getBankLogo(item.bankName)" />
          </div>
          <div class="bank-info">
            <div class="bank-name">
              {{ item.bankName }} - {{ item.accountNumber}}
            </div>
            <div class="bank-balance">{{ formatRupiah(item.totalBalance) }}</div>
          </div>
        </div>
        <div v-if="balances.length === 0" class="empty-state">
          No balance data available.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-container {
  margin-left: 1rem;
  margin-top: 4rem;
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.dashboard-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.chart-wrapper {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  padding: 1.5rem;
  width: 320px;
}

.chart-title {
  text-align: center;
  font-weight: 500;
  color: #666;
  margin-bottom: 1rem;
}

.chart-container {
  height: 250px;
  width: 250px;
  margin: 0 auto;
}

.banks-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  padding-top: 0.5rem;
}

.bank-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border-left: 4px solid transparent;
  width: 10cm;
}

.bank-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}


.bank-logo {
  width: 70px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.bank-logo {
  width: 80px;         /* Adjust size as needed */
  height: 60px;        /* Adjust size as needed */
  object-fit: cover;   /* Zooms/crops the image to fill the box */
  border-radius: 12px; /* Optional: rounded corners */
}

.bank-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bank-name {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
}

.bank-balance {
  font-size: 1rem;
  color: #666;
}


.empty-state {
  text-align: center;
  color: #666;
  padding: 2rem 0;
}
</style>