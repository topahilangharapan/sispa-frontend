<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useAuthStore } from '../stores/auth';
import { useTransactionStore } from '../stores/transaction';
import type { CashFlowChartInterface } from '../interfaces/transaction.interface';
import VDropdown from './VDropdown.vue'

const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const cashFlowData = ref<CashFlowChartInterface[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const viewType = ref<'month' | 'quarter' | 'year'>('month');
const selectedBank = ref('all');

const bankOptions = computed(() => {
  const bankSet = new Set<string>();
  cashFlowData.value.forEach(item => bankSet.add(item.bank));
  const options = Array.from(bankSet)
    .sort()
    .map(bank => ({ label: bank, value: bank }));

  return [{ label: 'ALL', value: 'all' }, ...options];
});

const timeOptions = [
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
];

const filteredData = computed(() => {
  let data = [...cashFlowData.value];

  if (selectedBank.value !== 'all') {
    data = data.filter(item => item.bank === selectedBank.value);
  }

  return data;
});

const groupedData = computed(() => {
  const data = filteredData.value;
  const result = new Map();

  data.forEach(item => {
    // Group by the selected view type
    let key;
    if (viewType.value === 'month') {
      key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    } else if (viewType.value === 'quarter') {
      key = `${item.year}-Q${item.quartal}`;
    } else {
      key = `${item.year}`;
    }

    if (result.has(key)) {
      result.set(key, result.get(key) + item.amount);
    } else {
      result.set(key, item.amount);
    }
  });

  return new Map([...result.entries()].sort());
});

const series = computed(() => {
  const values = Array.from(groupedData.value.values());

  return [
    {
      name: selectedBank.value === 'all' ? 'Total Cash Flow' : `${selectedBank.value} Cash Flow`,
      data: values,
    },
  ];
});

const chartOptions = computed(() => {
  const categories = Array.from(groupedData.value.keys());

  return {
    chart: {
      id: 'cash-flow-chart',
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 3,
      hover: {
        size: 4
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#a10000', '#b8020d'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
      }
    },
    title: {
      text: `Cash Flow by ${viewType.value.charAt(0).toUpperCase() + viewType.value.slice(1)}`,
      align: 'center',
    },
    subtitle: {
      text: selectedBank.value === 'all' ? 'All Banks' : `Bank: ${selectedBank.value}`,
      align: 'center',
    },
    xaxis: {
      categories,
      title: {
        text: viewType.value.charAt(0).toUpperCase() + viewType.value.slice(1),
      },
    },
    yaxis: {
      title: {
        text: 'Amount',
      },
      labels: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(val);
        },
      },
    },
    colors: ['#7c0004'],
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(val);
        },
      },
    },
    noData: {
      text: 'No data available',
      align: 'center',
      verticalAlign: 'middle',
    },
  };
});

const loadCashFlowData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (!authStore.token) {
      throw new Error('Authentication token is missing.');
    }

    await transactionStore.getCashFlowChart(authStore.token);
    cashFlowData.value = transactionStore.cashFlowCharts;

    if (cashFlowData.value.length === 0) {
      error.value = 'No cash flow data available.';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred while loading cash flow data.';
    console.error('Error loading cash flow data:', err);
  } finally {
    isLoading.value = false;
  }
};

// Initialize component
onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  await loadCashFlowData();
});


// Helper functions for summary information
const getTotalAmount = () => {
  const total = filteredData.value.reduce((sum, item) => sum + item.amount, 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(total);
};

const getTimePeriod = () => {
  if (filteredData.value.length === 0) return 'N/A';

  const dates = filteredData.value.map(item => {
    return new Date(item.year, item.month - 1, 1);
  });

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return `${minDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })} - ${maxDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`;
};
</script>
<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-8">
    <div class="w-full p-6 rounded-lg bg-white shadow-md">
      <div class="flex flex-wrap gap-6 mb-6">
        <div class="flex flex-col gap-2 min-w-[150px]">
          <VDropdown
            label="View by:"
            v-model="viewType"
            :options="timeOptions"
          >
          </VDropdown>
        </div>

        <div class="flex flex-col gap-2 min-w-[150px]">
          <VDropdown
            label="Filter by Bank:"
            v-model="selectedBank"
            :options="bankOptions"
          >
          </VDropdown>
        </div>
      </div>

      <div class="flex justify-between flex-wrap gap-4 mb-6 p-4 bg-brown-100/10 rounded-md border-l-4 border-red-300" v-if="!isLoading && !error && filteredData.length > 0">
        <div class="flex flex-col gap-1">
          <span class="text-sm text-gray-600 font-medium">Total Amount:</span>
          <span class="text-lg font-semibold text-gray-800">{{ getTotalAmount() }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-sm text-gray-600 font-medium">Time Period:</span>
          <span class="text-lg font-semibold text-gray-800">{{ getTimePeriod() }}</span>
        </div>
      </div>

      <div class="relative h-[400px] w-full">
        <div v-if="authStore.loading || transactionStore.loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <p>Loading cash flow data...</p>
        </div>
        <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <VueApexCharts
          v-else
          type="line"
          height="350"
          :options="chartOptions"
          :series="series"
        ></VueApexCharts>
      </div>
    </div>
  </div>
</template>
