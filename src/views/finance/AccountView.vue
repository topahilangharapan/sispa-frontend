<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRoute } from 'vue-router'
import { Banknote } from 'lucide-vue-next'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({
  "Cash Flow": "/finance/cash-flow"
});

const accountStore = useAccountStore();
const authStore = useAuthStore();
const route = useRoute();
const accountId = Number(route.params.id);
const isLoaded = ref(false);

function formatToRupiah(amount: number | undefined): string {
  if (typeof amount !== 'number') return '-'
  return 'Rp' + amount.toLocaleString('id-ID') + ',-'
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
              <!-- ✅ casting ke string -->
            </p>
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
            <!-- Belum diisi -->
          </table>
        </div>

      </div>
    </div>
  </section>
</template>
