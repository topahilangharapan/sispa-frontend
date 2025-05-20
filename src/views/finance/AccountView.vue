<script setup lang="ts">
import { ref, onMounted} from 'vue'
import VNavbar from '../../components/VNavbar.vue'
import VLoading from '../../components/VLoading.vue'
import { useAccountStore } from '../../stores/account.js'
import { useAuthStore } from '../../stores/auth.js'
import { useRoute, useRouter } from 'vue-router'

const title = ref({ 'Cash Flow': '/finance/cash-flow' });
const submodules = ref({
  "Cash Flow": "/finance/cash-flow"
});

const accountStore = useAccountStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const accountId = route.params.id as string;
const isLoaded = ref(false);

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
</template>

