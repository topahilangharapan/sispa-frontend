<script setup lang="ts">
import { ref, onMounted} from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRoute } from 'vue-router'
import VButton from '../../components/VButton.vue'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({
  "Cash Flow": "/finance/cash-flow"
});

const accountStore = useAccountStore();
const authStore = useAuthStore();
const route = useRoute();
const accountId = route.params.id as string;
const isLoaded = ref(false);
const transId = "I/2004/MANDIRI/20250520/0001"

function formatToRupiah(amount: number | undefined): string {
  if (typeof amount !== 'number') return '-'
  return 'Rp' + amount.toLocaleString('id-ID') + ',-'
}

function formatDateTimeToIndo(isoDate: string | undefined): string {
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

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  await accountStore.getAccountById(token, accountId)

})
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="accountStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <section class="p-6 min-h-screen mt-10">
    <div class="max-w-7xl mx-auto">
      <div class="p-6 space-y-6">

    <div class="rounded-xl shadow p-4 flex items-center space-x-4">
      <div class="w-12 h-12 bg-gray-200 rounded-full">
      </div>
      <div>
        <p class="large-text-normal">{{ accountStore.currentAccount?.bank}}</p>
        <p class="large-text-bold">{{ accountStore.currentAccount?.no}}</p>
        <p class="large-text-normal">{{ accountStore.currentAccount?.name}}</p>
        <p class="large-text-normal">{{ accountStore.currentAccount?.balance}}</p>
      </div>
      <div>
        <div class="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
        <div class="bg-white rounded-xl shadow p-4 pr-6 flex items-center space-x-4">
          <div class="w-12 h-12 bg-gray-200 rounded-full">
          </div>
          <div>
            <p class="large-text-bold text-red-400">{{ accountStore.currentAccount?.bank}}</p>
            <p class="large-text-bold">{{ accountStore.currentAccount?.no}}</p>
            <p class="large-text-normal">{{ accountStore.currentAccount?.name}}</p>
          </div>
          <div class="ml-auto text-left">
            <p class="text-2xl">{{ formatToRupiah(accountStore.currentAccount?.balance) }}</p>
            <p class="small-text-normal text-gray-400" >Terakhir diperbarui: {{ formatDateTimeToIndo(accountStore.currentAccount?.lastUpdated) }}</p>
          </div>
          <div>
            <td class="px-4 py-2 text-center">
              <RouterLink :to="`/finance/cash-flow/transaction?id=${transId}`">
                <VButton variant="primary" size="sm">Detail</VButton>
              </RouterLink>
            </td>
          </div>
        </div>

        <!-- Tab switcher -->
        <div class="flex space-x-4 border-b">
          <button class="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-semibold">
            Pemasukan
          </button>
          <button class="px-4 py-2 text-gray-500">
            Pengeluaran
          </button>
        </div>

        <!-- Chart -->
        <div class="bg-white rounded-xl shadow p-4">
          <canvas id="lineChart" class="w-full h-40"></canvas>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table class="min-w-full table-auto">

          </table>
        </div>
      </div>
    </div>
  </section>

</template>

