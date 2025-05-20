<script setup lang="ts">
import VNavbar from '../../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useAuthStore } from '../../stores/auth.ts'
import { useRoute } from 'vue-router';
import router from '../../router'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import { useTransactionStore } from '../../stores/transaction.ts'

const title = ref({ 'Finance': '/finance' });
const submodules = ref({
  "Invoice": "/finance/invoice",
  "Cashflow": "/finance/cash-flow",
});

const transactionStore = useTransactionStore()
const authStore = useAuthStore()
const route = useRoute();

const showDialog = ref(false);

const isLoaded = ref(false);

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  await transactionStore.getTransactionById(token, id)

  isLoaded.value = true;
});

</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="transactionStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div v-else-if="transactionStore.currentTransaction" class="p-8 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-3xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h2 class="heading-2">Detail Transaksi</h2>
<!--          <div class="flex space-x-2">-->
<!--            <VButton @click="() => (showDialog = true)" size="sm" variant="delete">-->
<!--              Hapus-->
<!--            </VButton>-->

<!--            <ConfirmationDialog-->
<!--              :visible="showDialog"-->
<!--              title="Hapus Vendor"-->
<!--              message="Apakah Anda yakin ingin menghapus vendor?"-->
<!--              @confirm="deleteVendor"-->
<!--              @cancel="() => (showDialog = false)"-->
<!--            />-->
<!--          </div>-->
        </div>
        <hr class="border-gray-300 border-t-2 mb-4" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">ID</p>
              <p class="large-text-normal">{{ transactionStore.currentTransaction.id }}</p>
            </div>
            <div>
              <p class="large-text-bold">Nominal</p>
              <p class="large-text-normal">{{  transactionStore.currentTransaction.amount }}</p>
            </div>
            <div>
              <p class="large-text-bold">Deskripsi</p>
              <p class="large-text-normal">{{ transactionStore.currentTransaction.description }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">Nomor Rekening</p>
              <p class="large-text-normal">{{ transactionStore.currentTransaction.account.name }}</p>
            </div>
            <div>
              <p class="large-text-bold">Kategori</p>
              <p class="large-text-normal">{{ transactionStore.currentTransaction.category }}</p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p class="large-text-bold">Created By</p>
            <p class="large-text-normal">{{ transactionStore.currentTransaction.createdBy }}</p>
          </div>
          <div>
            <p class="large-text-bold">Created At</p>
            <p class="large-text-normal">{{ new Date(transactionStore.currentTransaction.createdAt).toLocaleDateString() }}</p>
          </div>
        </div>
        <div class="flex justify-center mt-8">
          <VButton
            @click="router.push('/finance/cash-flow')"
            type="button"
            size="md"
            variant="delete"
            class="bg-slate-600 hover:bg-slate-800 text-white"
          >
            Kembali
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>
