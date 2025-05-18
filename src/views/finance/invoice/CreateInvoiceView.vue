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


const authStore = useAuthStore();
const purchaseOrderStore = usePurchaseOrderStore();
const invoiceStore = useInvoiceStore();
const router = useRouter();

const today = new Date().toISOString().split('T')[0];

const purchaseOrderOption = ref<{ value: string; label: string }[]>([]);
const selectedPurchaseOrder = ref();

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
</script>

<template>
  <VNavbar/>
  <VLoading v-if="purchaseOrderStore.loading || invoiceStore.loading" class="flex" />

  <div v-else class="p-8 mt-12 w-full min-h-screen">
    <h2 class="mb-6">Tambah Invoice</h2>

    <!-- Section: Pilih Purchase Order -->
    <div class="mb-6 bg-white p-6 rounded-lg shadow-sm">
      <h3 class="mb-4 font-semibold">Pilih Purchase Order</h3>
      <VDropdown
        v-model="invoice.purchaseOrderId"
        label="Purchase Order"
        :options="purchaseOrderOption"
        placeholder="Silakan pilih"
        :isEmpty="true"
        @update:modelValue="(val) => onSelectPurchaseOrder(val)"
        @update:hasError="updateErrorStatus('po', $event)"
      />

      <div v-if="invoice.purchaseOrderId" class="mt-4 p-4 bg-white rounded-lg shadow-sm border">
        <p><strong>No PO:</strong> {{ selectedPurchaseOrder?.noPo }}</p>
        <p><strong>Company:</strong> {{ selectedPurchaseOrder?.companyName }}</p>
        <p><strong>Total Harga:</strong> Rp{{ selectedPurchaseOrder?.total?.toLocaleString('us-US') }}</p>
        <p><strong>Date Created:</strong> {{ selectedPurchaseOrder?.dateCreated }}</p>
      </div>
    </div>

    <!-- Section: Form Invoice -->
    <div class="bg-white p-6 rounded-lg shadow-sm">
      <h3 class="mb-4 font-semibold">Detail Invoice</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VInputField
          label="Nama Penerima"
          v-model="invoice.receiver"
          placeholder="Masukkan nama penerima"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('receiver', $event)"
        />

        <VInputField
          label="Tempat Ditandatangani"
          v-model="invoice.placeSigned"
          placeholder="Masukkan tempat penandatanganan"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('placeSigned', $event)"
        />

        <VInputDateField
          label="Tanggal Dibuat"
          v-model="invoice.dateCreated"
          placeholder="DD/MM/YYYY"
          @update:hasError="updateErrorStatus('dateCreated', $event)"
        />

        <VInputDateField
          label="Tanggal Ditandatangani"
          v-model="invoice.dateSigned"
          placeholder="DD/MM/YYYY"
          :minDate="invoice.dateCreated"
          @update:hasError="updateErrorStatus('dateSigned', $event)"
        />

        <VInputField
          label="Penandatangan"
          v-model="invoice.signee"
          placeholder="Masukkan nama penandatangan"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('signee', $event)"
        />

        <VInputDateField
          label="Tanggal Pembayaran"
          v-model="invoice.datePaid"
          placeholder="DD/MM/YYYY"
          :minDate="invoice.dateCreated"
          @update:hasError="updateErrorStatus('datePaid', $event)"
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
        />

        <VInputField
          label="Nama Bank"
          v-model="invoice.bankName"
          placeholder="Masukkan nama bank"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('bankName', $event)"
        />

        <VInputField
          label="Nomor Rekening"
          v-model="invoice.accountNumber"
          placeholder="Masukkan nomor rekening"
          :isEmpty="true"
          :isNumberOnly="true"
          @update:hasError="updateErrorStatus('accountNumber', $event)"
        />

        <VInputField
          label="Atas Nama"
          v-model="invoice.onBehalf"
          placeholder="Masukkan nama pemilik rekening"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('onBehalf', $event)"
        />

        <VInputField
          label="Acara/Keterangan"
          v-model="invoice.event"
          placeholder="Masukkan keterangan acara"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('event', $event)"
        />
      </div>

      <div class="flex justify-end mt-6">
        <VButton
          variant="primary"
          :disabled="!isFormValid"
          @click="submitInvoice"
          size="lg"
        >
          Simpan Invoice
        </VButton>
      </div>
    </div>
  </div>
</template>
