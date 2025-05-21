<script setup lang="ts">
import VNavbar from '../../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useAuthStore } from '../../stores/auth.ts'
import { useRoute } from 'vue-router';
import router from '../../router'
import { useTransactionStore } from '../../stores/transaction.ts'
import type { IdTransactionInterface } from '../../interfaces/transaction.interface.ts'
import { FileText } from 'lucide-vue-next'

const title = ref({ 'Finance': '/finance' });
const submodules = ref({
  "Invoice": "/finance/invoice",
  "Cashflow": "/finance/cash-flow",
});

function formatToRupiah(amount: number | undefined): string {
  if (typeof amount !== 'number') return '-'
  return 'Rp' + amount.toLocaleString('id-ID') + ',-'
}

const transactionStore = useTransactionStore()
const authStore = useAuthStore()
const route = useRoute()
const transactionId = route.query.id as string
const isLoaded = ref(false);

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
  const payload: IdTransactionInterface = { id: transactionId };
  await transactionStore.getTransactionById(token, payload);
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />

  <div v-if="transactionStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div
    v-else-if="transactionStore.currentTransaction"
    class="p-8 bg-white-100 min-h-screen flex flex-col items-center"
  >
    <div class="w-full max-w-3xl mb-12 mt-16">
      <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative">

        <!-- Judul -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <FileText class="w-6 h-6 text-brown-400" />
            <h2 class="text-xl font-bold text-gray-800">Detail Transaksi</h2>
          </div>
        </div>

        <!-- Badge tipe transaksi -->
        <div class="mb-6">
          <span
            v-if="typeof transactionStore.currentTransaction.amount === 'number'"
            class="px-3 py-1 rounded-full text-sm font-semibold"
            :class="{
              'bg-pink-100 text-red-600': transactionStore.currentTransaction.amount < 0,
              'bg-green-100 text-green-700': transactionStore.currentTransaction.amount >= 0
            }"
          >
            {{ transactionStore.currentTransaction.amount < 0 ? 'Pengeluaran' : 'Pemasukan' }}
          </span>
        </div>

        <hr class="border-gray-200 mb-6" />

        <!-- Informasi utama -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">ID Transaksi</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ transactionStore.currentTransaction.id }}
              </p>
            </div>
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">Nominal</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ formatToRupiah(transactionStore.currentTransaction.amount) }}
              </p>
            </div>
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">Kategori</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ transactionStore.currentTransaction.category.name }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">Nomor Rekening</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ transactionStore.currentTransaction.account.no }}
              </p>
            </div>
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">Nama Pemilik Rekening</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ transactionStore.currentTransaction.account.name }}
              </p>
            </div>
            <div class="pb-3 border-b border-gray-100">
              <p class="text-sm text-gray-500">Bank</p>
              <p class="large-text-semibold font-medium text-gray-800">
                {{ transactionStore.currentTransaction.account.bank }}
              </p>
            </div>
          </div>
        </div>

        <!-- Deskripsi -->
        <div class="mt-8 border-t border-gray-100 pt-6">
          <p class="text-sm text-gray-500 mb-1">Deskripsi</p>
          <p class="large-text-semibold text-gray-700">
            {{ transactionStore.currentTransaction.description }}
          </p>
        </div>

        <!-- Metadata -->
        <div class="text-center mt-8 text-sm text-gray-400 italic">
          Dibuat oleh
          <span class="font-medium text-gray-600">
            {{ transactionStore.currentTransaction.createdBy }}
          </span>
          pada {{ formatDateTimeToIndo(transactionStore.currentTransaction.createdAt) }}
        </div>

        <!-- Tombol kembali -->
        <div class="flex justify-center mt-10">
          <VButton
            @click="router.push('/finance/cash-flow')"
            type="button"
            size="md"
            variant="delete"
            class="bg-slate-600 hover:bg-slate-800 text-white"
          >
            <span>Kembali</span>
          </VButton>
        </div>

      </div>
    </div>
  </div>
</template>
