<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Pie } from 'vue-chartjs'
import { useTransactionStore } from '../stores/transaction'
import { useAuthStore } from '../stores/auth'
ChartJS.register(ArcElement, Tooltip, Legend, Title)
const balanceStore = useTransactionStore()
const authStore = useAuthStore()
const isLoading = ref(true)
const hasError = ref(false)
const hasData = ref(false)

// test doang
const testData = {
  labels: ['Bank A', 'Bank B', 'Bank C'],
  datasets: [
    {
      label: 'Current Balance',
      data: [150000, 75000, 50000],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56'
      ],
      hoverOffset: 10,
    }
  ]
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


const chartData = computed(() => {
  if (balanceStore.balances && balanceStore.balances.length > 0) {
    return {
      labels: balanceStore.balances.map(b => b.bankName),
      datasets: [
        {
          label: 'Current Balance',
          data: balanceStore.balances.map(b => b.totalBalance),
          backgroundColor: generateColors(balanceStore.balances.length),
          hoverOffset: 8,
        }
      ]
    }
  }
  if (import.meta.env.DEV) {
    return testData
  }
  return {
    labels: [],
    datasets: [
      {
        label: 'Current Balance',
        data: [],
        backgroundColor: [],
        hoverOffset: 8,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10, 
        padding: 10, 
        font: {
          size: 11
        }
      }
    },
    title: {
      display: true,
      text: 'Current Balance',
      font: {
        size: 14
      },
      padding: {
        top: 10,
        bottom: 10
      }
    },
    tooltip: {
      titleFont: {
        size: 12 
      },
      bodyFont: {
        size: 11
      },
      padding: 8
    }
  },
  layout: {
    padding: 0
  },
  cutout: '0%'
}

onMounted(async () => {
  try {
    if (!authStore.token) {
      console.warn('No auth token available')
      hasData.value = false
      return
    }
    const success = await balanceStore.fetchBalances(authStore.token)
    if (
      success &&
      Array.isArray(balanceStore.balances) &&
      balanceStore.balances.length > 0
    ) {
      hasData.value = true
    } else if (import.meta.env.DEV) {
      hasData.value = true
    } else {
      hasData.value = false
    }
  } catch (err) {
    console.error('Error loading balance data:', err)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="chart-container">
    <div v-if="isLoading" class="status-message">
      <p>Loading chart data...</p>
    </div>
    <div v-else-if="hasError" class="status-message error">
      <p>Error loading chart data. Please try refreshing the page.</p>
    </div>
    <div v-else-if="!hasData" class="status-message">
      <p>No balance data available.</p>
    </div>
    <div v-else class="chart-wrapper">
      <Pie :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 250px;  
  height: 250px; 
  margin: 0 auto;
}
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.status-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  font-size: 14px;
  color: #666;
}
.error {
  color: #d32f2f;
}
</style>