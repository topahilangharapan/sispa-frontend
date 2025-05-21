<script setup lang="ts">
import { useAuthStore } from '../../../stores/auth.ts'
import { computed, onMounted, ref, toRaw } from 'vue'
import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useRouter } from 'vue-router'
import type {
  CreatePurchaseOrderInterface, PurchaseOrderItemInterface
} from '../../../interfaces/purchaseOrder.interface.ts'
import VNavbar from '../../../components/VNavbar.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'
import { useVendorStore } from '../../../stores/vendor.ts'
import { useClientStore } from '../../../stores/client.ts'
import VDropdown from '../../../components/VDropdown.vue'
import VInputDateField from '../../../components/VInputDateField.vue'
import VTextArea from '../../../components/VTextArea.vue'
import { useItemStore } from '../../../stores/item.ts'
import {
  FilePlus,
  Building,
  Users,
  PenTool,
  ShoppingCart,
  Plus,
  X,
  ClipboardList,
  FileText,
  Save,
  Package,
  ArrowLeft
} from 'lucide-vue-next'

const title = ref({ 'Marketing': '/marketing' })
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
})
const authStore = useAuthStore()
const purchaseOrderStore = usePurchaseOrderStore()
const vendorStore = useVendorStore()
const clientStore = useClientStore()
const itemStore = useItemStore()
const router = useRouter()

const selectedVendor = ref()
const selectedClient = ref()
const selectedOption = ref()
const showRecipientCard = ref(true)

const vendorOptions = ref<{ value: string; label: string }[]>([])
const clientOptions = ref<{ value: string; label: string }[]>([])
const itemOptions = ref<{ value: string; label: string }[]>([])

const selectedItemIds = ref<string[]>([])

const availableItemOptions = computed(() =>
  itemOptions.value.filter(option => !selectedItemIds.value.includes(option.value))
)

const setOption = (option: string) => {
  selectedOption.value = option
  purchaseOrder.value.vendorId = ""
  purchaseOrder.value.clientId = ""
  purchaseOrder.value.companyName = ""
  purchaseOrder.value.companyAddress = ""

  if (option.valueOf() === 'vendor') {
    hasErrors.value.client = false
    hasErrors.value.vendor = true
  }
  else if (option.valueOf() === 'client') {
    hasErrors.value.vendor = false
    hasErrors.value.client = true
  }
  else {
    hasErrors.value.vendor = false
    hasErrors.value.client = false
  }
}

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  if (!authStore.token) {
    console.error("Token tidak tersedia")
    return
  }

  await vendorStore.getVendors(authStore.token)
  await clientStore.getClients(authStore.token)
  await itemStore.getItems(authStore.token)

  if (vendorStore.vendors) {
    vendorOptions.value = vendorStore.vendors.map(vendor => ({
      value: String(vendor.id),
      label: String(vendor.name),
    }))
  }

  if (clientStore.clients) {
    clientOptions.value = clientStore.clients.map(client => ({
      value: String(client.id),
      label: String(client.name),
    }))
  }

  if (itemStore.items) {
    itemOptions.value = itemStore.items.map(item => ({
      value: String(item.id),
      label: String(item.title),
    }))
  }
})

const onSelectVendor = (vendorId: string) => {
  purchaseOrder.value.vendorId = vendorId

  selectedVendor.value = vendorStore.vendors.find(vendor => vendor.id === vendorId) || null
  purchaseOrder.value.companyName = selectedVendor.value.name
  purchaseOrder.value.companyAddress = selectedVendor.value.address
}

const onSelectClient = (clientId: string) => {
  purchaseOrder.value.clientId = clientId
  selectedClient.value = clientStore.clients.find(client => client.id === clientId) || null
  purchaseOrder.value.companyName = selectedClient.value.name
  purchaseOrder.value.companyAddress = selectedClient.value.address
}

const today = new Date().toISOString().split('T')[0]

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
})

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
})

const updateErrorStatus = (field: string, status: boolean) => {
  hasErrors.value[field] = status
}

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
)

let counter = 0

const addItem = () => {
  const newItem = {
    id: "",
    tempId: `item-${counter++}`, // ID berurutan
    title: "",
    volume: 0,
    unit: "",
    pricePerUnit: 0,
    description: "",
    status: "",
    tempTempId: "",
  }

  purchaseOrder.value.items.push(newItem)

  // Tambahkan error status berdasarkan ID unik
  updateErrorStatus(`item-${newItem.tempId}`, true)
  updateErrorStatus(`volume-${newItem.tempId}`, true)
}

const onSelectItem = (chosenId: string, item: PurchaseOrderItemInterface) => {
  const selected = itemStore.items.find(opt => opt.id === Number(chosenId))
  if (selected) {
    item.title = selected.title
    item.unit = selected.unit
    item.pricePerUnit = selected.pricePerUnit
    item.status = selected.status

    const prevId = String(item.tempTempId)

    const index = selectedItemIds.value.indexOf(prevId)

    if (index !== -1) selectedItemIds.value.splice(index, 1)

    if (chosenId) selectedItemIds.value.push(String(chosenId))

    item.tempTempId = item.id
  }
}

const removeItem = (tempId: string | number) => {
  const index = purchaseOrder.value.items.findIndex(item => item.tempId === tempId)
  if (index === -1) return

  const removedItem = purchaseOrder.value.items[index]

  if (removedItem.id) {
    const idx = selectedItemIds.value.indexOf(String(removedItem.id))
    if (idx !== -1) selectedItemIds.value.splice(idx, 1)
  }

  // Hapus item dari daftar
  purchaseOrder.value.items.splice(index, 1)

  // Hapus error status berdasarkan tempId
  delete hasErrors.value[`item-${tempId}`]
  delete hasErrors.value[`volume-${tempId}`]

  // Hapus error status berdasarkan tempId
  delete hasErrors.value[`item-undefined`]
  delete hasErrors.value[`volume-undefined`]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Fungsi Submit setelah konfirmasi modal
const submitPurchaseOrder = async () => {
  purchaseOrder.value.items.forEach((item) => {
    if (!item.description.trim()) item.description = "-"
  })

  const formattedPurchaseOrder = {
    ...toRaw(purchaseOrder.value),
    dateCreated: formatDate(purchaseOrder.value.dateCreated),
    dateSigned: formatDate(purchaseOrder.value.dateSigned),
  }

  if (!authStore.token) {
    throw new Error('Token is missing')
  }

  const isSuccess = await purchaseOrderStore.create(formattedPurchaseOrder, authStore.token)

  if (isSuccess) {
    await router.push('/marketing/purchase-order')
  }
}

const toggleRecipientCard = () => {
  showRecipientCard.value = !showRecipientCard.value
}

const goBack = () => {
  router.push('/marketing/purchase-order')
}

const getTotalPrice = (item: PurchaseOrderItemInterface) => {
  return item.volume * item.pricePerUnit
}

const getTotalAmount = computed(() => {
  return purchaseOrder.value.items.reduce((total, item) => {
    return total + (item.volume * item.pricePerUnit)
  }, 0)
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50" />

  <div v-if="purchaseOrderStore.loading || vendorStore.loading || clientStore.loading"
       class="flex items-center justify-center min-h-screen">
    <VLoading />
  </div>

  <div v-else class="flex flex-col gap-6 min-h-screen pt-20 px-6 pb-10">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button @click="goBack"
                class="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black-grey-175 transition-colors">
          <ArrowLeft :size="18" class="text-black-grey-700" />
        </button>
        <h1 class="text-2xl font-bold text-black-grey-800 flex items-center">
          <FilePlus :size="24" class="mr-2 text-red-200" />
          Buat Purchase Order Baru
        </h1>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col space-y-6">
      <!-- Recipient Selection Card -->
      <div class="bg-white-200 rounded-xl shadow-sm border border-black-grey-175">
        <div class="p-4 bg-white-300 border-b border-black-grey-175 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-black-grey-800 flex items-center">
            <Building :size="18" class="mr-2 text-red-200" />
            Pilih Penerima Purchase Order
          </h2>
          <button @click="toggleRecipientCard" class="text-black-grey-400 hover:text-black-grey-600">
            <span v-if="showRecipientCard">▲</span>
            <span v-else>▼</span>
          </button>
        </div>

        <div v-if="showRecipientCard" class="p-6">
          <div class="flex gap-4 mb-6">
            <VButton
              :variant="selectedOption === 'vendor' ? 'primary' : 'outline'"
              @click="setOption('vendor')"
              class="flex items-center">
              <Building :size="16" class="mr-2" />
              Vendor
            </VButton>
            <VButton
              :variant="selectedOption === 'client' ? 'primary' : 'outline'"
              @click="setOption('client')"
              class="flex items-center">
              <Users :size="16" class="mr-2" />
              Client
            </VButton>
            <VButton
              :variant="selectedOption === 'manual' ? 'primary' : 'outline'"
              @click="setOption('manual')"
              class="flex items-center">
              <PenTool :size="16" class="mr-2" />
              Isi Sendiri
            </VButton>
          </div>

          <div v-if="selectedOption === 'vendor'" class="animate-fade">
            <VDropdown
              v-model="purchaseOrder.vendorId"
              label="Vendor"
              :options="vendorOptions"
              placeholder="Silakan pilih vendor"
              :isEmpty="true"
              @update:modelValue="onSelectVendor"
              @update:hasError="updateErrorStatus('vendor', $event)"
            />
            <div v-if="purchaseOrder.vendorId" class="mt-4 p-5 bg-white-300 rounded-lg border border-black-grey-175">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-black-grey-400 text-sm">Nama Vendor</p>
                  <p class="font-medium">{{ selectedVendor?.name }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Email</p>
                  <p class="font-medium">{{ selectedVendor?.email }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Layanan</p>
                  <p class="font-medium">{{ selectedVendor?.service }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Alamat</p>
                  <p class="font-medium">{{ selectedVendor?.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedOption === 'client'" class="animate-fade">
            <VDropdown
              v-model="purchaseOrder.clientId"
              label="Client"
              :options="clientOptions"
              placeholder="Silakan pilih client"
              :isEmpty="true"
              @update:modelValue="onSelectClient"
              @update:hasError="updateErrorStatus('client', $event)"
            />
            <div v-if="purchaseOrder.clientId" class="mt-4 p-5 bg-white-300 rounded-lg border border-black-grey-175">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-black-grey-400 text-sm">Nama Client</p>
                  <p class="font-medium">{{ selectedClient?.name }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Email</p>
                  <p class="font-medium">{{ selectedClient?.email }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Industri</p>
                  <p class="font-medium">{{ selectedClient?.industry }}</p>
                </div>
                <div>
                  <p class="text-black-grey-400 text-sm">Alamat</p>
                  <p class="font-medium">{{ selectedClient?.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedOption === 'manual'" class="text-black-grey-400 text-center mt-4 p-4 bg-white-300 rounded-lg border border-dashed border-black-grey-200">
            <PenTool :size="24" class="mx-auto mb-2 text-black-grey-400" />
            Silakan isi informasi perusahaan pada field di bawah
          </div>
        </div>
      </div>

      <!-- Main Form and Items Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Purchase Order Form -->
        <div class="lg:col-span-1">
          <div class="bg-white-200 rounded-xl shadow-sm border border-black-grey-175 h-full">
            <div class="p-4 bg-white-300 border-b border-black-grey-175">
              <h2 class="text-lg font-semibold text-black-grey-800 flex items-center">
                <FileText :size="18" class="mr-2 text-red-200" />
                Detail Purchase Order
              </h2>
            </div>

            <div class="p-6 space-y-5">
              <VInputField
                label="Nama Perusahaan"
                v-model="purchaseOrder.companyName"
                placeholder="Masukkan nama perusahaan"
                :isEmpty="true"
                :disabled="(selectedOption === 'vendor') || (selectedOption === 'client')"
                @update:hasError="updateErrorStatus('companyName', $event)"
                leftIcon="Building"
              />

              <VInputField
                label="Alamat Perusahaan"
                v-model="purchaseOrder.companyAddress"
                placeholder="Masukkan alamat perusahaan"
                :isEmpty="true"
                :disabled="(selectedOption === 'vendor') || (selectedOption === 'client')"
                @update:hasError="updateErrorStatus('companyAddress', $event)"
                leftIcon="MapPin"
              />

              <VInputField
                label="Nama Penerima"
                v-model="purchaseOrder.receiver"
                placeholder="Masukkan nama penerima"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('receiver', $event)"
                leftIcon="User"
              />

              <VTextArea
                label="Ketentuan"
                v-model="purchaseOrder.terms"
                placeholder="Masukkan ketentuan"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('terms', $event)"
                class="min-h-[100px]"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VInputDateField
                  v-model="purchaseOrder.dateCreated"
                  label="Tanggal Dibuat"
                  placeholder="DD/MM/YYYY"
                  @update:hasError="updateErrorStatus('dateCreated', $event)"
                />

                <VInputDateField
                  label="Tanggal Ditandatangani"
                  v-model="purchaseOrder.dateSigned"
                  placeholder="DD/MM/YYYY"
                  :minDate="purchaseOrder.dateCreated"
                  @update:hasError="updateErrorStatus('dateSigned', $event)"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VInputField
                  label="Tempat Ditandatangani"
                  v-model="purchaseOrder.placeSigned"
                  placeholder="Masukkan tempat"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('placeSigned', $event)"
                  leftIcon="MapPin"
                />

                <VInputField
                  label="Penandatangan"
                  v-model="purchaseOrder.signee"
                  placeholder="Masukkan nama"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('signee', $event)"
                  leftIcon="User"
                />
              </div>

              <!-- Summary Section -->
              <div v-if="purchaseOrder.items.length > 0" class="mt-6 pt-5 border-t border-black-grey-175">
                <h3 class="text-md font-semibold mb-3 text-black-grey-700">Ringkasan Order</h3>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-black-grey-600">Jumlah Item:</span>
                    <span class="font-medium">{{ purchaseOrder.items.length }} item</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-black-grey-600">Total Nilai:</span>
                    <span class="font-semibold text-red-200">{{ formatCurrency(getTotalAmount) }}</span>
                  </div>
                </div>
              </div>

              <VButton
                variant="primary"
                size="lg"
                :disabled="!isFormValid"
                @click="submitPurchaseOrder"
                class="w-full mt-6  flex items-center justify-center">
                <Save :size="18" class="mr-2" />
                Simpan Purchase Order
              </VButton>
            </div>
          </div>
        </div>

        <!-- Items List -->
        <div class="lg:col-span-2">
          <div class="bg-white-200 rounded-xl shadow-sm border border-black-grey-175 h-full">
            <div class="p-4 bg-white-300 border-b border-black-grey-175 flex justify-between items-center">
              <h2 class="text-lg font-semibold text-black-grey-800 flex items-center">
                <ShoppingCart :size="18" class="mr-2 text-red-200" />
                Daftar Item
              </h2>
              <VButton
                variant="primary"
                @click="addItem"
                class="bg-green-800 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition flex items-center"
              >
                <Plus :size="16" class="mr-1" />
                Tambah Item
              </VButton>
            </div>

            <div class="p-6">
              <div v-if="purchaseOrder.items.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
                <Package :size="48" class="text-black-grey-200 mb-4" />
                <p class="text-black-grey-400 mb-2">Belum ada item ditambahkan</p>
                <p class="text-sm text-black-grey-400">Klik tombol "Tambah Item" untuk menambahkan item ke purchase order</p>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="(item, index) in purchaseOrder.items" :key="item.tempId"
                  class="border border-black-grey-175 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white-200"
                >
                  <div class="bg-white-300 px-4 py-3 border-b border-black-grey-175 flex justify-between items-center">
                    <h3 class="font-medium text-black-grey-700 flex items-center">
                      <ClipboardList :size="16" class="mr-2 text-red-200" />
                      Item {{ index + 1 }}
                    </h3>
                    <button
                      @click="removeItem(item.tempId)"
                      class="flex items-center justify-center w-6 h-6 rounded-full bg-red-200 text-white hover:bg-red-175 transition"
                    >
                      <X :size="14" />
                    </button>
                  </div>

                  <div class="p-4 space-y-4">
                    <VDropdown
                      v-model="item.id"
                      label="Pilih Item"
                      :options="itemOptions"
                      :availableOptions="availableItemOptions"
                      placeholder="Silakan pilih item"
                      :isEmpty="true"
                      @update:modelValue="(val) => onSelectItem(val, item)"
                      @update:hasError="updateErrorStatus(`item-${item.tempId}`, $event)"
                    />

                    <div class="grid grid-cols-2 gap-4">
                      <VInputField
                        label="Nama Item"
                        v-model="item.title"
                        placeholder="-"
                        :isEmpty="true"
                        :disabled="true"
                      />

                      <VInputField
                        label="Status"
                        v-model="item.status"
                        placeholder="-"
                        :isEmpty="true"
                        :disabled="true"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <VInputField
                        label="Satuan"
                        v-model="item.unit"
                        placeholder="-"
                        :isEmpty="true"
                        :disabled="true"
                      />

                      <VInputField
                        label="Harga per Satuan"
                        v-model="item.pricePerUnit"
                        placeholder="0"
                        :isEmpty="true"
                        :isNumberOnly="true"
                        :isNegative="false"
                        :useThousandSeparator="true"
                        :disabled="true"
                      />
                    </div>

                    <VInputField
                      label="Volume"
                      v-model="item.volume"
                      placeholder="Masukkan jumlah"
                      :isEmpty="true"
                      :isNumberOnly="true"
                      :isNegative="false"
                      :useThousandSeparator="true"
                      @update:hasError="updateErrorStatus(`volume-${item.tempId}`, $event)"
                    />

                    <VTextArea
                      label="Deskripsi"
                      v-model="item.description"
                      placeholder="Masukkan deskripsi (opsional)"
                      :disabled="true"
                    />

                    <div v-if="item.volume && item.pricePerUnit" class="pt-3 mt-2 border-t border-black-grey-175">
                      <div class="flex justify-between items-center">
                        <span class="text-black-grey-600">Total:</span>
                        <span class="font-semibold text-red-200">{{ formatCurrency(getTotalPrice(item)) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
