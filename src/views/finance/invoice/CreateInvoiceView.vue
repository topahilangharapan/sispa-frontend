<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'
import { useAuthStore } from '../../../stores/auth.ts'
import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useInvoiceStore } from '../../../stores/invoice.ts'
import { useRouter } from 'vue-router'
import type { InvoiceInterface } from '../../../interfaces/invoice.interface.ts'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import VDropdown from '../../../components/VDropdown.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'
import VInputDateField from '../../../components/VInputDateField.vue'
import {
  ChevronsRight,
  Check,
  ArrowLeft,
  Building,
  ShoppingBag,
  Calendar,
  User,
  Landmark,
  FileText,
  Save,
  AlertTriangle,
  Info,
  ReceiptText
} from 'lucide-vue-next'

const authStore = useAuthStore();
const purchaseOrderStore = usePurchaseOrderStore();
const invoiceStore = useInvoiceStore();
const router = useRouter();

const today = new Date().toISOString().split('T')[0];
const sectionActive = ref(1);
const purchaseOrderOption = ref<{ value: string; label: string }[]>([]);
const selectedPurchaseOrder = ref();
const formSubmitted = ref(false);

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  if (!authStore.token) {
    console.error("Token tidak tersedia");
    return;
  }

  await purchaseOrderStore.fetchAll(authStore.token);

  if (purchaseOrderStore.purchaseOrders) {
    purchaseOrderOption.value = purchaseOrderStore.purchaseOrders.map(po => ({
      value: String(po.id),
      label: String(po.noPo),
    }));
  }
});

const invoice = ref<InvoiceInterface>({
  receiver: "",
  placeSigned: "",
  dateCreated: today,
  dateSigned: today,
  signee: "",
  purchaseOrderId: 0,
  datePaid: today,
  ppnPercentage: 0,
  bankName: "",
  accountNumber: "",
  onBehalf: "",
  event: "",
  id: 0,
  noPo: "",
  noInvoice: "",
  items: []
});

const hasErrors = ref({
  po: true,
  receiver: true,
  placeSigned: true,
  signee: true,
  ppnPercentage: true,
  bankName: true,
  accountNumber: true,
  onBehalf: true,
  event: true,
  dateSigned: false,
  dateCreated: false,
  datePaid: false,
});

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const submitInvoice = async () => {
  formSubmitted.value = true;
  if (!isFormValid.value) {
    sectionActive.value = 2;
    return;
  }

  const formattedInvoice = {
    ...toRaw(invoice.value),
    dateCreated: formatDate(invoice.value.dateCreated),
    dateSigned: formatDate(invoice.value.dateSigned),
    datePaid: formatDate(invoice.value.datePaid),
  };

  if (authStore.token == null) {
    return
  }

  const isSuccess = await invoiceStore.create(formattedInvoice, authStore.token);
  if (isSuccess) await router.push('/finance/invoice');
};

const onSelectPurchaseOrder = (poId: string) => {
  selectedPurchaseOrder.value = purchaseOrderStore.purchaseOrders.find(po => po.id === Number(poId)) || null;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};
</script>

<template>
  <VNavbar />
  <VLoading v-if="purchaseOrderStore.loading || invoiceStore.loading" class="flex" />

  <div v-else class="min-h-screen pt-16 pb-8 px-4">
    <div class="max-w-screen-lg mx-auto">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="flex items-center space-x-2">
          <button @click="router.push('/finance/invoice')" class="flex items-center text-[#595959] hover:text-[#2E2E2E] transition duration-200">
            <ArrowLeft class="h-4 w-4 mr-1" />
            <span>Kembali</span>
          </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between mt-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-[#2E2E2E] flex items-center">
              <ReceiptText :size="50" class="mr-4 text-[#B32225]" />
              Tambah Invoice Baru
            </h1>
          </div>
        </div>
      </div>

      <!-- Progress Steps -->
      <div class="flex items-center mb-6">
        <div class="flex flex-col items-center">
          <div :class="`flex items-center justify-center h-10 w-10 rounded-full ${sectionActive === 1 ? 'bg-[#8F2527]' : (invoice.purchaseOrderId ? 'bg-[#9C804F]' : 'bg-[#D8D8D8]')}`">
            <ShoppingBag class="h-5 w-5 text-white" v-if="sectionActive === 1 || !invoice.purchaseOrderId" />
            <Check class="h-5 w-5 text-white" v-else />
          </div>
          <span class="text-sm mt-1 font-medium text-[#2E2E2E]">Pilih PO</span>
        </div>

        <div class="h-1 flex-1 mx-4 mb-6" :class="invoice.purchaseOrderId ? 'bg-[#9C804F]' : 'bg-[#D8D8D8]'"></div>

        <div class="flex flex-col items-center">
          <div :class="`flex items-center justify-center h-10 w-10 rounded-full ${sectionActive === 2 ? 'bg-[#8F2527]' : (isFormValid ? 'bg-[#9C804F]' : 'bg-[#D8D8D8]')}`">
            <FileText class="h-5 w-5 text-white" v-if="sectionActive === 2 || !isFormValid" />
            <Check class="h-5 w-5 text-white" v-else />
          </div>
          <span class="text-sm mt-1 font-medium text-[#2E2E2E]">Detail Invoice</span>
        </div>
      </div>

      <!-- Section 1: Pilih Purchase Order -->
      <div v-if="sectionActive === 1" class="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECECEC] mb-4">
        <div class="p-5 border-b border-[#ECECEC] flex items-center">
          <ShoppingBag class="h-5 w-5 text-[#8F2527] mr-2" />
          <h2 class="text-xl font-bold text-[#2E2E2E]">Pilih Purchase Order</h2>
        </div>

        <div class="p-6">
          <div class="max-w-md">
            <VDropdown
              v-model="invoice.purchaseOrderId"
              label="Purchase Order"
              :options="purchaseOrderOption"
              placeholder="Silakan pilih Purchase Order"
              :isEmpty="true"
              @update:modelValue="(val) => onSelectPurchaseOrder(val)"
              @update:hasError="updateErrorStatus('po', $event)"
            />
          </div>

          <div v-if="selectedPurchaseOrder" class="mt-6 p-5 rounded-lg border border-[#D8D8D8] bg-[#F7F8FA]">
            <h3 class="font-semibold text-lg mb-3 text-[#2E2E2E] flex items-center">
              <Building class="h-5 w-5 mr-2 text-[#9C804F]" />
              Detail Purchase Order
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <div class="text-[#595959] text-sm">No. Purchase Order</div>
                <div class="font-medium text-[#2E2E2E]">{{ selectedPurchaseOrder?.noPo }}</div>
              </div>

              <div>
                <div class="text-[#595959] text-sm">Nama Perusahaan</div>
                <div class="font-medium text-[#2E2E2E]">{{ selectedPurchaseOrder?.companyName }}</div>
              </div>

              <div>
                <div class="text-[#595959] text-sm">Total Harga</div>
                <div class="font-medium text-[#2E2E2E] text-[#8F2527]">
                  {{ formatCurrency(selectedPurchaseOrder?.total || 0) }}
                </div>
              </div>

              <div>
                <div class="text-[#595959] text-sm">Tanggal Dibuat</div>
                <div class="font-medium text-[#2E2E2E] flex items-center">
                  <Calendar class="h-4 w-4 mr-1 text-[#9C804F]" />
                  {{ selectedPurchaseOrder?.dateCreated }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mt-6">
            <VButton
              variant="primary"
              :disabled="!invoice.purchaseOrderId"
              @click="sectionActive = 2"
              size="lg"
              class="px-6 py-2.5 rounded-lg flex items-center"
            >
              <span>Lanjutkan</span>
              <ChevronsRight class="h-4 w-4 ml-1" />
            </VButton>
          </div>
        </div>
      </div>

      <!-- Section 2: Form Invoice -->
      <div v-if="sectionActive === 2" class="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECECEC]">
        <div class="p-5 border-b border-[#ECECEC] flex items-center">
          <FileText class="h-5 w-5 text-[#8F2527] mr-2" />
          <h2 class="text-xl font-bold text-[#2E2E2E]">Detail Invoice</h2>
        </div>

        <div class="p-6">
          <!-- Alert if form has errors on submit -->
          <div v-if="formSubmitted && !isFormValid" class="mb-6 p-4 bg-[#FFEBEB] border border-[#B32225] rounded-lg flex items-start">
            <AlertTriangle class="h-5 w-5 text-[#B32225] mr-2 mt-0.5" />
            <div>
              <p class="font-medium text-[#3E1011]">Harap periksa formulir</p>
              <p class="text-sm text-[#5D1D1E]">Pastikan semua data yang diperlukan telah diisi dengan benar.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <!-- Column 1: Informasi Dasar -->
            <div>
              <h3 class="font-semibold text-md mb-4 text-[#2E2E2E] flex items-center">
                <Info class="h-4 w-4 mr-2 text-[#9C804F]" />
                Informasi Dasar
              </h3>

              <div class="space-y-4">
                <VInputField
                  label="Nama Penerima"
                  v-model="invoice.receiver"
                  placeholder="Masukkan nama penerima"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('receiver', $event)"
                  icon="User"
                />

                <VInputField
                  label="Acara/Keterangan"
                  v-model="invoice.event"
                  placeholder="Masukkan keterangan acara"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('event', $event)"
                  icon="FileText"
                />

                <VInputField
                  label="PPN (%)"
                  v-model="invoice.ppnPercentage"
                  placeholder="Masukkan persentase PPN"
                  :isEmpty="true"
                  :isNumberOnly="true"
                  :isNegative="false"
                  :maxLength="3"
                  @update:hasError="updateErrorStatus('ppnPercentage', $event)"
                  icon="Percent"
                />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VInputDateField
                    label="Tanggal Dibuat"
                    v-model="invoice.dateCreated"
                    placeholder="DD/MM/YYYY"
                    @update:hasError="updateErrorStatus('dateCreated', $event)"
                    icon="Calendar"
                  />

                  <VInputDateField
                    label="Tanggal Pembayaran"
                    v-model="invoice.datePaid"
                    placeholder="DD/MM/YYYY"
                    :minDate="invoice.dateCreated"
                    @update:hasError="updateErrorStatus('datePaid', $event)"
                    icon="CalendarClock"
                  />
                </div>
              </div>

              <h3 class="font-semibold text-md mt-8 mb-4 text-[#2E2E2E] flex items-center">
                <Landmark class="h-4 w-4 mr-2 text-[#9C804F]" />
                Informasi Rekening
              </h3>

              <div class="space-y-4">
                <VInputField
                  label="Nama Bank"
                  v-model="invoice.bankName"
                  placeholder="Masukkan nama bank"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('bankName', $event)"
                  icon="Landmark"
                />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <VInputField
                    label="Nomor Rekening"
                    v-model="invoice.accountNumber"
                    placeholder="Masukkan nomor rekening"
                    :isEmpty="true"
                    :isNumberOnly="true"
                    @update:hasError="updateErrorStatus('accountNumber', $event)"
                    icon="CreditCard"
                  />

                  <VInputField
                    label="Atas Nama"
                    v-model="invoice.onBehalf"
                    placeholder="Masukkan nama pemilik rekening"
                    :isEmpty="true"
                    @update:hasError="updateErrorStatus('onBehalf', $event)"
                    icon="User"
                  />
                </div>
              </div>
            </div>

            <!-- Column 2: Informasi Penandatanganan -->
            <div>
              <h3 class="font-semibold text-md mb-4 text-[#2E2E2E] flex items-center">
                <User class="h-4 w-4 mr-2 text-[#9C804F]" />
                Informasi Penandatanganan
              </h3>

              <div class="space-y-4">
                <VInputField
                  label="Penandatangan"
                  v-model="invoice.signee"
                  placeholder="Masukkan nama penandatangan"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('signee', $event)"
                  icon="User"
                />

                <VInputField
                  label="Tempat Ditandatangani"
                  v-model="invoice.placeSigned"
                  placeholder="Masukkan tempat penandatanganan"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('placeSigned', $event)"
                  icon="MapPin"
                />

                <VInputDateField
                  label="Tanggal Ditandatangani"
                  v-model="invoice.dateSigned"
                  placeholder="DD/MM/YYYY"
                  :minDate="invoice.dateCreated"
                  @update:hasError="updateErrorStatus('dateSigned', $event)"
                  icon="Calendar"
                />
              </div>

              <div v-if="selectedPurchaseOrder" class="mt-8 p-5 rounded-lg border border-[#ECECEC] bg-[#F7F8FA]">
                <h3 class="font-semibold text-md mb-3 text-[#2E2E2E] flex items-center">
                  <ShoppingBag class="h-4 w-4 mr-2 text-[#9C804F]" />
                  Purchase Order Terpilih
                </h3>

                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-[#595959]">No. PO:</span>
                    <span class="font-medium text-[#2E2E2E]">{{ selectedPurchaseOrder?.noPo }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-[#595959]">Perusahaan:</span>
                    <span class="font-medium text-[#2E2E2E]">{{ selectedPurchaseOrder?.companyName }}</span>
                  </div>

                  <div class="flex justify-between">
                    <span class="text-[#595959]">Total:</span>
                    <span class="font-medium text-[#8F2527]">
                      {{ formatCurrency(selectedPurchaseOrder?.total || 0) }}
                    </span>
                  </div>
                </div>

                <button @click="sectionActive = 1" class="mt-4 text-[#8F2527] hover:text-[#B32225] text-sm font-medium flex items-center">
                  <ArrowLeft class="h-3 w-3 mr-1" />
                  Ubah Purchase Order
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8 pt-4 border-t border-[#ECECEC]">
            <VButton
              variant="outline"
              @click="sectionActive = 1"
              size="lg"
              class="bg-[#ECECEC] hover:bg-[#D8D8D8] text-[#595959] px-6 py-2.5 rounded-lg flex items-center"
            >
              <ArrowLeft class="h-4 w-4 mr-1" />
              <span>Kembali</span>
            </VButton>

            <VButton
              variant="primary"
              @click="submitInvoice"
              size="lg"
              class="px-6 py-2.5 rounded-lg flex items-center"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
            >
              <Save class="h-4 w-4 mr-1" />
              <span>Simpan Invoice</span>
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for components */
</style>
