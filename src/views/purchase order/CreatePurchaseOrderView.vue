<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw } from 'vue'
import VInputField from '../../components/VInputField.vue'
import VNavbar from '../../components/VNavbar.vue'
import VButton from '../../components/VButton.vue'
import type { PurchaseOrderInterface } from '../../interfaces/purchaseOrder.interface.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { usePurchaseOrderStore } from '../../stores/purchaseOrder.ts'
import { useRouter } from 'vue-router'
import VLoading from '../../components/VLoading.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
});
const authStore = useAuthStore();
const purchaseOrderStore = usePurchaseOrderStore();
const router = useRouter(); // Inisialisasi router

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }
});

const today = new Date().toISOString().split('T')[0];

const purchaseOrder = ref<PurchaseOrderInterface>({
  companyName: "",
  companyAddress: "",
  receiver: "",
  items: [],
  terms: "",
  placeSigned: "",
  dateCreated: today,
  dateSigned: today,
  signee: "",
});

const hasErrors = ref({
  companyName: true,
  companyAddress: true,
  receiver: true,
  terms: true,
  placeSigned: true,
  dateCreated: false,
  dateSigned: false,
  signee: true
});

const updateErrorStatus = (field, status) => {
  hasErrors.value[field] = status;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const addItem = () => {
  const newItem = {
    tempId: crypto.randomUUID(), // ID unik untuk tiap item
    title: "",
    volume: "",
    unit: "",
    pricePerUnit: "",
    description: "",
  };

  purchaseOrder.value.items.push(newItem);

  // Tambahkan error status berdasarkan ID unik
  updateErrorStatus(`title-${newItem.tempId}`, true);
  updateErrorStatus(`volume-${newItem.tempId}`, true);
  updateErrorStatus(`unit-${newItem.tempId}`, true);
  updateErrorStatus(`pricePerUnit-${newItem.tempId}`, true);
};


const removeItem = (tempId) => {
  const index = purchaseOrder.value.items.findIndex(item => item.tempId === tempId);
  if (index === -1) return;

  // Hapus item dari daftar
  purchaseOrder.value.items.splice(index, 1);

  // Hapus error status berdasarkan tempId
  delete hasErrors.value[`title-${tempId}`];
  delete hasErrors.value[`volume-${tempId}`];
  delete hasErrors.value[`unit-${tempId}`];
  delete hasErrors.value[`pricePerUnit-${tempId}`];
  delete hasErrors.value[`description-${tempId}`];

  // Hapus error status berdasarkan tempId
  delete hasErrors.value[`title-undefined`];
  delete hasErrors.value[`volume-undefined`];
  delete hasErrors.value[`unit-undefined`];
  delete hasErrors.value[`pricePerUnit-undefined`];
  delete hasErrors.value[`description-undefined`];

  console.log(hasErrors.value)
};


const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Fungsi Submit setelah konfirmasi modal
const submitPurchaseOrder = async () => {

  purchaseOrder.value.items.forEach((item) => {
    if (!item.description.trim()) item.description = "-";
  });

  const formattedPurchaseOrder = {
    ...toRaw(purchaseOrder.value),
    dateCreated: formatDate(purchaseOrder.value.dateCreated),
    dateSigned: formatDate(purchaseOrder.value.dateSigned),
  };

  const isSuccess = await purchaseOrderStore.create(formattedPurchaseOrder, authStore.token);

  if (isSuccess) {
    await router.push('/marketing/purchase-order');
  }

};

</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50"></VNavbar>
  <VLoading v-if="purchaseOrderStore.loading" class="flex mr-64"/>

  <div v-else class="flex gap-4 h-screen mt-12 p-4">
    <!-- Card Tambah Purchase Order (1/3 Lebar Page) -->
    <div class="w-1/3 bg-white p-4 rounded-lg flex flex-col gap-4">
      <h2 class="mb-4">Tambah Purchase Order</h2>

      <VInputField
        label="Nama Perusahaan"
        v-model="purchaseOrder.companyName"
        placeholder="Masukkan nama perusahaan"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('companyName', $event)"
      />

      <VInputField
        label="Alamat Perusahaan"
        v-model="purchaseOrder.companyAddress"
        placeholder="Masukkan alamat perusahaan"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('companyAddress', $event)"
      />

      <VInputField
        label="Nama Penerima"
        v-model="purchaseOrder.receiver"
        placeholder="Masukkan nama penerima"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('receiver', $event)"
      />

      <VInputField
        label="Ketentuan"
        v-model="purchaseOrder.terms"
        placeholder="Masukkan ketentuan"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('terms', $event)"
      />

      <VInputField
        label="Tempat Ditandatangani"
        v-model="purchaseOrder.placeSigned"
        placeholder="Masukkan tempat penandatanganan"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('placeSigned', $event)"
      />

      <VInputField
        label="Tanggal Dibuat"
        v-model="purchaseOrder.dateCreated"
        type="date"
        placeholder="Pilih tanggal dibuat"
        @update:hasError="updateErrorStatus('dateCreated', $event)"
      />

      <VInputField
        label="Tanggal Ditandatangani"
        v-model="purchaseOrder.dateSigned"
        type="date"
        placeholder="Pilih tanggal ditandatangani"
        @update:hasError="updateErrorStatus('dateSigned', $event)"
      />

      <VInputField
        label="Penandatangan"
        v-model="purchaseOrder.signee"
        placeholder="Masukkan nama penandatangan"
        :isEmpty="true"
        @update:hasError="updateErrorStatus('signee', $event)"
      />

      <VButton variant="primary" :disabled="!isFormValid" @click="submitPurchaseOrder" class="w-full mt-4" size="md">
        Simpan Purchase Order
      </VButton>
    </div>

    <!-- Card Daftar Item (2/3 Lebar Page) -->
    <div class="w-2/3 bg-white p-4 rounded-lg flex flex-col h-full overflow-auto gap-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Daftar Item</h2>
        <VButton
          variant="primary"
          @click="addItem"
          class="bg-green-800 text-white px-2 py-1 rounded-full hover:bg-green-700 transition text-semibold"
        >
          Tambah Item
        </VButton>
      </div>

      <div v-if="purchaseOrder.items.length === 0" class="text-black-grey-400 text-normal italic text-center">
        Belum ada item ditambahkan
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="(item, index) in purchaseOrder.items" :key="item.tempId"
          class="relative border border-gray-200 p-4 rounded-lg flex flex-col shadow-md gap-4 bg-white transition-all hover:shadow-lg h-auto flex-grow min-h-[200px]"
        >
          <VButton
            variant="primary"
            @click="removeItem(item.tempId)"
            class="absolute top-4 right-4 bg-red-200 text-white px-2 py-1 rounded-full hover:bg-red-175 transition text-xs"
          >
            ✕
          </VButton>

          <h3 class="font-semibold text-gray-700">Item {{ index + 1 }}</h3>

          <VInputField
            label="Nama Item"
            v-model="item.title"
            placeholder="Masukkan nama item"
            :isEmpty="true"
            @update:hasError="updateErrorStatus(`title-${item.tempId}`, $event)"
          />
          <VInputField
            label="Volume"
            v-model="item.volume"
            placeholder="Masukkan volume"
            :isEmpty="true"
            :isNumberOnly="true"
            :isNegative="false"
            :useThousandSeparator="true"
            @update:hasError="updateErrorStatus(`volume-${item.tempId}`, $event)"
          />
          <VInputField
            label="Satuan"
            v-model="item.unit"
            placeholder="Masukkan satuan"
            :isEmpty="true"
            @update:hasError="updateErrorStatus(`unit-${item.tempId}`, $event)"
          />
          <VInputField
            label="Harga per Satuan"
            v-model="item.pricePerUnit"
            placeholder="Masukkan harga per satuan"
            :isEmpty="true"
            :isNumberOnly="true"
            :isNegative="false"
            :useThousandSeparator="true"
            @update:hasError="updateErrorStatus(`pricePerUnit-${item.tempId}`, $event)"
          />
          <VInputField
            label="Deskripsi"
            v-model="item.description"
            placeholder="Masukkan deskripsi"
            @update:hasError="updateErrorStatus(`description-${item.tempId}`, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

