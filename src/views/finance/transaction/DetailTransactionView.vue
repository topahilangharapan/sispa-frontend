<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import { FileText, ArrowLeft, Building, CreditCard, Tag, Text, User, Trash2 } from 'lucide-vue-next'
import type { IdTransactionInterface } from '../../../interfaces/transaction.interface.ts'
import { useTransactionStore } from '../../../stores/transaction.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import router from '../../../router'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

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
const showDialog = ref(false)

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

async function handleDelete() {
  if (!authStore.token || !transactionStore.currentTransaction) {
    window.$toast('error', 'Token atau transaksi tidak tersedia.')
    showDialog.value = false
    return
  }

  const success = await transactionStore.deleteTransaction(authStore.token, { id: transactionStore.currentTransaction.id })
  showDialog.value = false

  if (success) {
    router.push('/finance/cash-flow')
  } else {
    window.$toast('error', 'Gagal menghapus transaksi.')
  }
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

function goBack() {
  router.push('/finance/cash-flow')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 mt-8">
    <VNavbar :title="title" :submodules="submodules" />

    <div v-if="transactionStore.loading" class="w-11/12 max-w-4xl mt-8">
      <VLoading :isDone="isLoaded" />
    </div>

    <div v-else-if="transactionStore.currentTransaction" class="bg-white w-11/12 max-w-4xl rounded-lg shadow-md mt-8 p-8">
      <!-- Header -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <!-- Judul dan Icon -->
          <div class="flex items-center gap-3">
            <FileText class="text-[#8F2527]" :size="24" />
            <h2 class="text-2xl font-bold text-[#3E1011]">Detail Transaksi</h2>
          </div>

          <!-- Badge (Label) -->
          <span
            v-if="typeof transactionStore.currentTransaction.amount === 'number'"
            class="px-3 py-1 rounded-full text-sm font-semibold"
            :class="{
        'bg-[#FFE0E0] text-[#8F2527]': transactionStore.currentTransaction.amount < 0,
        'bg-[#E0FFEA] text-[#0B8A3F]': transactionStore.currentTransaction.amount >= 0
      }"
          >
      {{ transactionStore.currentTransaction.amount < 0 ? 'PENGELUARAN' : 'PEMASUKAN' }}
    </span>
        </div>
      </div>

      <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 my-4"></div>

      <!-- Main Transaction Info -->
      <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">ID Transaksi</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
              {{ transactionStore.currentTransaction.id }}
            </div>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nominal</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] font-medium"
                 :class="{ 'text-[#8F2527]': transactionStore.currentTransaction.amount < 0, 'text-[#0B8A3F]': transactionStore.currentTransaction.amount >= 0 }">
              {{ formatToRupiah(transactionStore.currentTransaction.amount) }}
            </div>
          </div>
        </div>

        <div class="mt-4">
          <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Kategori</span>
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
            <Tag :size="14" class="mr-2 text-[#9C804F]" />
            {{ transactionStore.currentTransaction.category.name }}
          </div>
          </div>
        <div class="mt-4">
          <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Deskripsi</span>
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
            <Text :size="14" class="mr-2 text-[#9C804F]" />
            {{ transactionStore.currentTransaction.description }}
          </div>
        </div>
      </div>

      <!-- Account Details -->
      <div class="flex items-center gap-2 mt-6">
        <Building :size="18" class="text-[#8F2527]" />
        <h3 class="text-lg font-semibold text-[#2E2E2E]">Detail Rekening</h3>
      </div>

      <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4 mt-4">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nomor Rekening</span>
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
            <CreditCard :size="14" class="mr-2 text-[#9C804F]" />
            {{ transactionStore.currentTransaction.account.no }}
          </div>
        </div>

        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Pemilik Rekening</span>
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
            <User :size="14" class="mr-2 text-[#9C804F]" />
            {{ transactionStore.currentTransaction.account.name }}
          </div>
        </div>

        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Bank</span>
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
            <Building :size="14" class="mr-2 text-[#9C804F]" />
            {{ transactionStore.currentTransaction.account.bank }}
          </div>
        </div>
      </div>

        <div class="bg-white p-3 rounded-md text-gray-400 flex items-center">
          <User :size="14" class="mr-2" />
          <span class="text-normal text-gray-400">Dibuat oleh <span class="font-medium">{{ transactionStore.currentTransaction.createdBy }}</span> pada {{ formatDateTimeToIndo(transactionStore.currentTransaction.createdAt) }}</span>
        </div>

      <!-- Back Button -->
      <div class="flex justify-between mt-6">
        <VButton
          variant="primary"
          size="md"
          @click="goBack"
          class="flex items-center bg-brown-100 hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
          <ArrowLeft :size="16" class="mr-1" />
          Kembali ke list
        </VButton>
          <VButton
            @click="() => (showDialog = true)"
            size="sm"
            variant="delete"
            class="flex items-center bg-[#8F2527] hover:bg-[#3E1011] text-white px-4 py-2 rounded-md border-none transition-colors duration-200">
            <Trash2 :size="16" class="mr-1" />
            Hapus
          </VButton>
      </div>
      <ConfirmationDialog
        :visible="showDialog"
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi?"
        @confirm="handleDelete"
        @cancel="() => (showDialog = false)"
      />
    </div>
  </div>
</template>
