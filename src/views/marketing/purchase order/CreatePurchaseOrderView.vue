<script setup lang="ts">

import { useAuthStore } from '../../../stores/auth.ts'
import { computed, onMounted, ref, toRaw } from 'vue'
import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useRouter } from 'vue-router'
import type {
  CreatePurchaseOrderInterface,
} from '../../../interfaces/purchaseOrder.interface.ts'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'
import { useVendorStore } from '../../../stores/vendor.ts'
import { useClientStore } from '../../../stores/client.ts'
import VDropdown from '../../../components/VDropdown.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
});
const authStore = useAuthStore();
const purchaseOrderStore = usePurchaseOrderStore();
const vendorStore = useVendorStore();
const clientStore = useClientStore();
const router = useRouter(); // Inisialisasi router

const selectedVendor = ref();
const selectedClient = ref();
const selectedOption = ref();

const vendorOptions = ref<{ value: string; label: string }[]>([]);
const clientOptions = ref<{ value: string; label: string }[]>([]);

const setOption = (option : string) => {
  selectedOption.value = option;
  purchaseOrder.value.vendorId = "";
  purchaseOrder.value.clientId = "";
  purchaseOrder.value.companyName = "";
  purchaseOrder.value.companyAddress = "";

  if (option.valueOf() === 'vendor') {
    hasErrors.value.client = false;
    hasErrors.value.vendor = true;
  }
  else if (option.valueOf() === 'client') {
    hasErrors.value.vendor = false;
    hasErrors.value.client = true;
  }
  else {
    hasErrors.value.vendor = false;
    hasErrors.value.client = false;
  }
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  if (!authStore.token) {
    console.error("Token tidak tersedia");
    return;
  }

  await vendorStore.getVendors(authStore.token)
  await clientStore.getClients(authStore.token)

  if (vendorStore.vendors) {
    vendorOptions.value = vendorStore.vendors.map(vendor => ({
      value: String(vendor.id),
      label: String(vendor.name),
    }));
  }

  if (clientStore.clients) {
    clientOptions.value = clientStore.clients.map(client => ({
      value: String(client.id),
      label: String(client.name),
    }));
  }
});

const onSelectVendor = (vendorId: string) => {
  purchaseOrder.value.vendorId = vendorId;

  selectedVendor.value = vendorStore.vendors.find(vendor => vendor.id === vendorId) || null;
  purchaseOrder.value.companyName = selectedVendor.value.name;
  purchaseOrder.value.companyAddress = selectedVendor.value.address;
};

const onSelectClient = (clientId: string) => {
  purchaseOrder.value.clientId = clientId;
  selectedClient.value = clientStore.clients.find(client => client.id === clientId) || null;
  purchaseOrder.value.companyName = selectedClient.value.name;
  purchaseOrder.value.companyAddress = selectedClient.value.address;
};

const today = new Date().toISOString().split('T')[0];

const purchaseOrder = ref<CreatePurchaseOrderInterface>({
  id: 0,
  vendorId: "",
  clientId: "",
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

const hasErrors = ref<Record<string, boolean>>({
  vendor: true,
  client: true,
  companyName: true,
  companyAddress: true,
  receiver: true,
  terms: true,
  placeSigned: true,
  dateCreated: false,
  dateSigned: false,
  signee: true
});


const updateErrorStatus = (field: string, status: boolean) => {
  hasErrors.value[field] = status;
};


const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

let counter = 0;

const addItem = () => {
  const newItem = {
    id: Date.now(), // Gunakan timestamp sebagai ID sementara
    tempId: `item-${counter++}`, // ID berurutan
    title: "",
    volume: 0,
    unit: "",
    pricePerUnit: 0,
    description: "",
    sum: 0, // Nilai awal untuk sum
  };


  purchaseOrder.value.items.push(newItem);

  // Tambahkan error status berdasarkan ID unik
  updateErrorStatus(`title-${newItem.tempId}`, true);
  updateErrorStatus(`volume-${newItem.tempId}`, true);
  updateErrorStatus(`unit-${newItem.tempId}`, true);
  updateErrorStatus(`pricePerUnit-${newItem.tempId}`, true);
};



const removeItem = (tempId: string | number) => {
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

  if (!authStore.token) {
    throw new Error('Token is missing');
  }
  const isSuccess = await purchaseOrderStore.create(formattedPurchaseOrder, authStore.token);

  if (isSuccess) {
    await router.push('/marketing/purchase-order');
  }

};

</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50" />
  <VLoading v-if="purchaseOrderStore.loading || vendorStore.loading || clientStore.loading" class="flex"/>

  <div v-else class="flex flex-col gap-4 h-screen mt-12 p-4">
    <!-- Card Tambah Vendor -->
    <div class="bg-white p-6 rounded-lg shadow-sm w-full mt-4">
      <h2 class="mb-4">Pilih Penerima Purchase Order</h2>

      <div class="flex gap-4 mb-4">
        <VButton
          :variant="selectedOption === 'vendor' ? 'primary' : 'outline'"
          @click="setOption('vendor')">
          Vendor
        </VButton>
        <VButton
          :variant="selectedOption === 'client' ? 'primary' : 'outline'"
          @click="setOption('client')">
          Client
        </VButton>
        <VButton
          :variant="selectedOption === 'manual' ? 'primary' : 'outline'"
          @click="setOption('manual')">
          Isi Sendiri
        </VButton>
      </div>

      <div v-if="selectedOption === 'vendor'">
        <VDropdown
          v-model="purchaseOrder.vendorId"
          label="Vendor"
          :options="vendorOptions"
          placeholder="Silakan pilih"
          :isEmpty="true"
          @update:modelValue="onSelectVendor"
          @update:hasError="updateErrorStatus('vendor', $event)"
        />
        <div v-if="purchaseOrder.vendorId" class="mt-4 p-4 bg-white rounded-lg shadow-sm border">
          <p><strong>Nama:</strong> {{ selectedVendor?.name }}</p>
          <p><strong>Email:</strong> {{ selectedVendor?.email }}</p>
          <p><strong>Alamat:</strong> {{ selectedVendor?.address }}</p>
          <p><strong>Layanan:</strong> {{ selectedVendor?.service }}</p>
        </div>
      </div>

      <div v-if="selectedOption === 'client'">
        <VDropdown
          v-model="purchaseOrder.clientId"
          label="Client"
          :options="clientOptions"
          placeholder="Silakan pilih"
          :isEmpty="true"
          @update:modelValue="onSelectClient"
          @update:hasError="updateErrorStatus('client', $event)"
        />
        <div v-if="purchaseOrder.clientId" class="mt-4 p-4 bg-white rounded-lg shadow-sm border">
          <p><strong>Nama:</strong> {{ selectedClient?.name }}</p>
          <p><strong>Email:</strong> {{ selectedClient?.email }}</p>
          <p><strong>Alamat:</strong> {{ selectedClient?.address }}</p>
          <p><strong>Industri:</strong> {{ selectedClient?.industry }}</p>
        </div>
      </div>

      <div v-if="selectedOption === 'manual'" class="text-gray-500 italic text-center mt-4">
        Silakan isi pada field di bawah
      </div>
    </div>


    <!-- Row untuk Tambah Purchase Order dan Daftar Item -->
    <div class="flex gap-4">
      <!-- Card Tambah Purchase Order -->
      <div class="w-1/3 bg-white p-4 rounded-lg flex flex-col gap-4 mb-4">
        <h2 class="mb-4">Tambah Purchase Order</h2>

        <VInputField
          label="Nama Perusahaan"
          v-model="purchaseOrder.companyName"
          placeholder="Masukkan nama perusahaan"
          :isEmpty="true"
          :disabled="(selectedOption === 'vendor') || (selectedOption === 'client')"
          @update:hasError="updateErrorStatus('companyName', $event)"
        />

        <VInputField
          label="Alamat Perusahaan"
          v-model="purchaseOrder.companyAddress"
          placeholder="Masukkan alamat perusahaan"
          :isEmpty="true"
          :disabled="(selectedOption === 'vendor') || (selectedOption === 'client')"
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

        <VButton variant="primary" size="lg" :disabled="!isFormValid" @click="submitPurchaseOrder" class="w-full mt-4">
          Simpan Purchase Order
        </VButton>
      </div>

      <!-- Card Daftar Item -->
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
  </div>
</template>


