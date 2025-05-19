<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import VNavbar from '../components/VNavbar.vue'
import VLoading from '../components/VLoading.vue'
import BalancePieChart from '../components/BalancePieChart.vue'
import { useAuthStore } from '../stores/auth.ts'
import { useTransactionStore } from '../stores/transaction.ts'

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

const balances = computed(() => balanceStore.balances || [])
const colors = computed(() => generateColors(balances.value.length))

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
    <div class="chart-wrapper">
      <div class="left-chart">
        <BalancePieChart />
      </div>
      <div class="right-content">
        <ul>
          <li v-for="(item, index) in balances" :key="index">
            <span class="color-box" :style="{ backgroundColor: colors[index] }"></span>
            {{ item.bankName }} : {{ formatRupiah(item.totalBalance) }}
          </li>
          <li v-if="balances.length === 0" style="color: #999;">
            No balance data available.
          </li>
        </ul>
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

.chart-wrapper {
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
  padding: 1.5rem;

  display: flex;
  gap: 2rem;
  max-width: 800px;
  width: 40%;
}

.left-chart {
  flex: 0 0 250px;
  height: 250px;
}

.right-content {
  flex: 1;
  color: #333;
  font-size: 1rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 0;
}

.right-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.right-content li {
  margin-bottom: 0.6rem;
  display: flex;
  align-items: center;
}

.color-box {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 0.75rem;
  border-radius: 3px;
}
</style>