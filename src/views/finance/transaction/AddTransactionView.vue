
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import VLoading from '../../../components/VLoading.vue';
import VDropdown from '../../../components/VDropdown.vue';
import VInputField from '../../../components/VInputField.vue';
import VCheckbox from '../../../components/VCheckbox.vue';
import VButton from '../../../components/VButton.vue';
import VNavbar from '../../../components/VNavbar.vue'
import { Plus, Minus, Wallet, Info, Check, CreditCard } from 'lucide-vue-next';
import { useAccountStore } from '../../../stores/account.js'
import { useAuthStore } from '../../../stores/auth.js'
import type { AccountInterface } from '../../../interfaces/account.interface.ts'
import { useTransactionStore } from '../../../stores/transaction.ts'
import type {
  AddTransactionRequestInterface,
  TransactionCategoryInterface
} from '../../../interfaces/transaction.interface.ts'

// Form state
const selectedAccountId = ref<string | number | undefined>(undefined);
const savedAccountId = sessionStorage.getItem('selectedAccountId');

const transactionType = ref('income');
const amountError = ref(false);

const accountStore = useAccountStore();
const authStore = useAuthStore();
const transactionStore = useTransactionStore();

const transactionCategoryOption = ref<{ value: string; label: string }[]>([]);

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  if (authStore.token) {
    await accountStore.getAccounts(authStore.token);

    await transactionStore.getCategories(authStore.token);
    transactionCategoryOption.value = transactionStore?.categories?.map((category: TransactionCategoryInterface) => ({
      value: category.name,
      label: category.name,
    })) || [];
  }

  if (savedAccountId) {
    watch(
      () => accountOptions.value.length,
      (newLength) => {
        if (newLength > 0) {
          selectedAccountId.value = Number(savedAccountId);
          sessionStorage.removeItem('selectedAccountId');
        }
      },
      { immediate: true, once: true }
    );
  }
});

const transaction = ref<AddTransactionRequestInterface>({
  amount: 0,
  description: "",
  account: "",
  category: "",

  isAdmin: false,

  isInterest: false,
});

interface HasErrors {
  [key: string]: boolean;
}

const hasErrors = ref<HasErrors>({
  amount: true,
  account: true,
  category: true,
});

const accountOptions = computed(() => {
  return accountStore.accounts.map((account: AccountInterface) => ({
    value: account.id,
    label: `${account.bank} | ${account.no} ${account.name}`
  }));
});

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const selectedAccount = computed<AccountInterface | null>(() => {
  if (!selectedAccountId.value) return null;
  updateErrorStatus('account', false)
  return accountStore.accounts.find((account: AccountInterface) => account.id === selectedAccountId.value) || null;
});

const remainingBalance = computed(() => {
  if (!selectedAccount.value || !transaction.value.amount) return selectedAccount.value?.balance || 0;

  const numAmount = Number(transaction.value.amount);
  if (transactionType.value === 'income') {
    return selectedAccount.value.balance + numAmount;
  } else {
    return selectedAccount.value.balance - numAmount;
  }
});


watch([selectedAccountId, transaction.value.amount, transactionType, transaction.value.isAdmin, transaction.value.isInterest], () => {
  if (transaction.value.isAdmin) {
    transaction.value.amount = selectedAccount.value?.adminFee ?? 0;
    transaction.value.category = "ADMINISTRASI BANK";
  }

  if (transaction.value.isInterest) {
    const interestRate = selectedAccount.value?.interestRate ?? 0;
    const balance = selectedAccount.value?.balance ?? 0;
    transaction.value.amount = interestRate * balance;
    transaction.value.category = "BUNGA BANK";
  }

  if (selectedAccount.value && transactionType.value === 'expense') {
    amountError.value = Number(transaction.value.amount) > selectedAccount.value.balance;
  } else {
    amountError.value = false;
  }
});

watch(() => transaction.value.amount, () => {
  if (selectedAccount.value && transactionType.value === 'expense') {
    amountError.value = Number(transaction.value.amount) > selectedAccount.value.balance;
  } else {
    amountError.value = false;
  }
});

watch(() => transactionType.value, () => {
  transaction.value.isAdmin = false;
  transaction.value.isInterest = false;
});

watch(() => transaction.value.isAdmin, () => {
  if (selectedAccount.value) {
    transaction.value.amount = selectedAccount.value?.adminFee;
    transaction.value.category = "ADMINISTRASI BANK"
  }
});

watch(() => transaction.value.isInterest, () => {
  if (selectedAccount.value) {
    transaction.value.amount = selectedAccount.value?.interestRate * selectedAccount.value?.balance;
    transaction.value.category = "BUNGA BANK"
  }
});

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

// Form submission
const submitForm = async () => {
  if (!isFormValid.value) return;

  if (selectedAccount.value) {

    const payload = {
      ...transaction.value,
      account: selectedAccount.value.no,
    };

    const isSuccess = await transactionStore.add(payload, transactionType.value, authStore.token!);

    if (isSuccess && selectedAccount.value) {

      if (transactionType.value === 'expense') {
        selectedAccount.value.balance -= Number(payload.amount)
      } else {
        selectedAccount.value.balance += Number(payload.amount)
      }

      // Simpan selectedAccountId ke sessionStorage
      if (selectedAccountId.value !== undefined) {
        sessionStorage.setItem('selectedAccountId', String(selectedAccountId.value));
      }

      // Reload halaman
      window.location.reload();
    }
  }
};
</script>


<template>
  <VNavbar></VNavbar>
  <VLoading v-if="accountStore.loading || transactionStore.loading" class="flex" />

  <div v-else class="min-h-screen py-8">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-16">
        <!-- Left side - Main form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Transaction Type Selection Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-gray-800 mb-4">Tipe Transaksi</h2>
            <div class="grid grid-cols-2 gap-4">
              <!-- Income -->
              <div
                @click="transactionType = 'income'"
                class="cursor-pointer p-4 rounded-lg border-2 flex items-center transition-all duration-200"
                :class="transactionType === 'income' ? 'border-green-500 bg-green-50' : 'border-gray-200'"
              >
                <div class="mr-3 rounded-full p-2" :class="transactionType === 'income' ? 'bg-green-100' : 'bg-gray-100'">
                  <Plus :size="24" :class="transactionType === 'income' ? 'text-green-600' : 'text-gray-500'" />
                </div>
                <div>
              <span class="font-medium" :class="transactionType === 'income' ? 'text-green-700' : 'text-gray-700'">
                Pemasukan
              </span>
                  <p class="text-xs text-gray-500">Menambah saldo akun</p>
                </div>
              </div>

              <div
                @click="transactionType = 'expense'"
                class="cursor-pointer p-4 rounded-lg border-2 flex items-center transition-all duration-200"
                :class="transactionType === 'expense' ? 'border-red-500 bg-red-50' : 'border-gray-200'"
              >
                <div class="mr-3 rounded-full p-2" :class="transactionType === 'expense' ? 'bg-red-100' : 'bg-gray-100'">
                  <Minus :size="24" :class="transactionType === 'expense' ? 'text-red-600' : 'text-gray-500'" />
                </div>
                <div>
        <span class="font-medium" :class="transactionType === 'expense' ? 'text-red-700' : 'text-gray-700'">
          Pengeluaran
        </span>
                  <p class="text-xs text-gray-500">Mengurangi saldo akun</p>
                </div>
              </div>
            </div>

            <!-- Optional Settings -->
            <div v-if="transactionType === 'income' || transactionType === 'expense'" class="pt-3 border-t border-gray-200 mt-6">
              <h3 class="text-gray-800 mb-3">Pengaturan Tambahan</h3>

              <div v-if="transactionType === 'income'" class="ml-1">
                <VCheckbox
                  v-model="transaction.isInterest"
                  label="Bunga Bank"
                />
                <p class="text-xs text-gray-500 ml-6 mt-1">
                  Transaksi ini akan tercatat sebagai pendapatan bunga
                </p>
              </div>

              <div v-if="transactionType === 'expense'" class="ml-1">
                <VCheckbox
                  v-model="transaction.isAdmin"
                  label="Administrasi Bank"
                />
                <p class="text-xs text-gray-500 ml-6 mt-1">
                  Transaksi ini akan tercatat sebagai biaya administrasi
                </p>
              </div>
            </div>
          </div>

          <!-- Main Form Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-800 mb-6">Detail Transaksi</h2>

            <form @submit.prevent="submitForm" class="space-y-5">
              <!-- Account Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Akun</label>
                <VDropdown
                  v-model="selectedAccountId"
                  :options="accountOptions"
                  placeholder="Silakan pilih akun"
                  :isEmpty="true"
                />
              </div>

              <!-- Amount Field -->
              <div>
                  <VInputField
                    v-model="transaction.amount"
                    placeholder="0"
                    :isNumberOnly="true"
                    label="Jumlah (Rp)"
                    :isEmpty="true"
                    :useThousandSeparator="true"
                    @update:hasError="updateErrorStatus('amount', $event)"
                  />
                <p v-if="amountError" class="text-red-175 small-text-normal mt-1">
                  Jumlah melebihi saldo akun!
                </p>
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Transaksi</label>
                <VDropdown
                  v-model="transaction.category"
                  :options="transactionCategoryOption"
                  :disabled="transaction.isAdmin || transaction.isInterest"
                  placeholder="Pilih kategori"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('category', $event)"
                />
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <VInputField
                  v-model="transaction.description"
                  placeholder="Tulis deskripsi transaksi disini..."
                  :multiline="true"
                  :rows="3"
                />
              </div>
            </form>
          </div>
        </div>

        <!-- Right side - Account info and action -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Selected Account Info -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-800 mb-4">Informasi Akun</h2>

            <div v-if="selectedAccount" class="space-y-4">
              <div class="flex items-start">
                <div class="rounded-full p-2 bg-red-175/10 mr-3">
                  <CreditCard :size="24" stroke="currentColor" class="text-red-175" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">{{ selectedAccount.name }}</h3>
                  <p class="text-sm text-gray-500">No: {{ selectedAccount.no }}</p>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Saldo Saat Ini</span>
                  <span class="font-semibold text-gray-800">Rp{{ selectedAccount.balance.toLocaleString() }}</span>
                </div>

                <div class="border-t border-gray-200 my-3"></div>

                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium" :class="transactionType === 'income' ? 'text-green-600' : 'text-red-600'">
                    {{ transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
                  </span>
                  <span class="font-semibold" :class="transactionType === 'income' ? 'text-green-600' : 'text-red-600'">
                    {{ transactionType === 'income' ? '+' : '-' }} Rp{{ transaction.amount ? Number(transaction.amount).toLocaleString() : '0' }}
                  </span>
                </div>

                <div class="border-t border-gray-200 my-3"></div>

                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-700">Saldo Akhir</span>
                  <span
                    class="font-bold text-lg"
                    :class="{
                      'text-green-600': remainingBalance > 0,
                      'text-red-600': remainingBalance < 0,
                      'text-gray-600': remainingBalance === 0
                    }"
                  >
                    Rp{{ remainingBalance.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

              <div
                v-else
                class="flex flex-col items-center justify-center text-center px-6 py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300"
              >
                <Wallet :size="32" class="text-gray-400" />
                <p class="mt-3 text-sm text-gray-500">
                  Silakan pilih akun untuk melihat informasi saldo
                </p>
              </div>

          </div>

          <!-- Action Button -->
          <div class="bg-white rounded-lg shadow p-6">
            <VButton
              variant="primary"
              size="lg"
              @click="submitForm"
              :disabled="!isFormValid"
              class="w-full"
            >
              <span class="flex items-center justify-center">
                <Check :size="20" class="mr-2"></Check>
                Simpan Transaksi
              </span>
            </VButton>

            <div class="mt-4 text-center">
              <a href="/finance/cash-flow" class="text-sm text-gray-500 hover:text-gray-700">
                Batal dan kembali
              </a>
            </div>
          </div>

          <!-- Help Tips -->
          <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div class="flex">
              <div class="flex-shrink-0">
                <Info :size="32" class="text-blue-800"></Info>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">Tips</h3>
                <div class="mt-2 text-sm text-blue-700 space-y-1">
                  <p>Semua transaksi akan langsung memperbarui saldo akun setelah disimpan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
