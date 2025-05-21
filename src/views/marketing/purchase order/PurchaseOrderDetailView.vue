<script setup lang="ts">
//Purchase Order Detail
import { usePurchaseOrderStore } from '../../../stores/purchaseOrder.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import {
  FileText,
  AlertCircle,
  Loader,
  Building,
  User,
  MapPin,
  Calendar,
  PenTool,
  ShoppingBag,
  PackageX,
  ArrowLeft,
  Trash2,
  Download,
} from 'lucide-vue-next'
import VButton from '../../../components/VButton.vue'
import VNavbar from '../../../components/VNavbar.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

const purchaseOrderStore = usePurchaseOrderStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const showDialog = ref<number | null>(null)
const title = ref({ 'Marketing': '/marketing' })
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
})

onMounted(async () => {
  if (!authStore.token) {
    return
  }
  const orderId = Number(route.params.id)
  await purchaseOrderStore.fetchDetail(orderId, authStore.token)
})

function goBack() {
  router.push('/marketing/purchase-order')
}

async function deleteOrder(orderId: number) {
  if (!authStore.token) return
  const success = await purchaseOrderStore.deletePurchaseOrder(orderId, authStore.token)
  if (success) {
    window.$toast('success', 'Purchase order deleted!')
    router.push('/marketing/purchase-order')
  } else {
    window.$toast('error', 'Failed to delete purchase order')
  }
}

async function downloadPurchaseOrder() {
  if (!authStore.token || !purchaseOrderStore.selectedPurchaseOrder) return

  const id = purchaseOrderStore.selectedPurchaseOrder.id
  await purchaseOrderStore.downloadPurchaseOrder(id, authStore.token)
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 mt-8">
    <VNavbar :title="title" :submodules="submodules" />

    <div class="bg-white w-11/12 max-w-4xl rounded-lg shadow-md mt-8 p-8">
      <div class="flex items-center gap-3 mb-4">
        <FileText class="text-[#8F2527]" :size="24" />
        <h2 class="text-2xl font-bold text-[#3E1011]">Purchase Order Details</h2>
      </div>

      <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 my-4"></div>

      <div v-if="purchaseOrderStore.loading" class="flex items-center justify-center p-6">
        <Loader :size="24" class="animate-spin text-[#8F2527] mr-2" />
        <span class="text-[#595959]">Loading purchase order details...</span>
      </div>

      <div v-if="purchaseOrderStore.error" class="flex items-center gap-2 p-4 bg-red-50 text-[#8F2527] rounded-md border-l-4 border-[#B32225] mb-4">
        <AlertCircle :size="18" />
        {{ purchaseOrderStore.error }}
      </div>

      <div v-if="purchaseOrderStore.selectedPurchaseOrder" class="flex flex-col gap-6">
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">PO ID</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
                {{ purchaseOrderStore.selectedPurchaseOrder.id }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Tanggal Dibuat</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#9C804F]" />
                {{ purchaseOrderStore.selectedPurchaseOrder.dateCreated }}
              </div>
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Penerima</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#3E1011] font-medium">
              {{ purchaseOrderStore.selectedPurchaseOrder.receiver }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <Building :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Informasi Perusahaan</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Perusahaan</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <Building :size="14" class="mr-2 text-[#9C804F]" />
              {{ purchaseOrderStore.selectedPurchaseOrder.companyName }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Alamat Perusahaan</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <MapPin :size="14" class="mr-2 text-[#9C804F]" />
              {{ purchaseOrderStore.selectedPurchaseOrder.companyAddress }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Ketentuan</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
              {{ purchaseOrderStore.selectedPurchaseOrder.terms }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <PenTool :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Informasi Tanda Tangan</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Penandatangan</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <User :size="14" class="mr-2 text-[#9C804F]" />
              {{ purchaseOrderStore.selectedPurchaseOrder.signee }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Tempat Ditandatangani</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <MapPin :size="14" class="mr-2 text-[#8F2527]" />
                {{ purchaseOrderStore.selectedPurchaseOrder.placeSigned }}
              </div>
            </div>

            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Tanggal Ditandatangani</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ purchaseOrderStore.selectedPurchaseOrder.dateSigned }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <ShoppingBag :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Purchase Order Items</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg border border-[#D8D8D8] overflow-hidden">
          <div class="overflow-x-auto">
            <table v-if="purchaseOrderStore.selectedPurchaseOrder.items?.length" class="w-full border-collapse">
              <thead>
              <tr class="bg-[#483B24] text-[#F7F8FA]">
                <th class="w-12 p-3 text-left text-sm font-medium">No.</th>
                <th class="w-1/4 p-3 text-left text-sm font-medium">Title</th>
                <th class="p-3 text-left text-sm font-medium">Volume</th>
                <th class="p-3 text-left text-sm font-medium">Unit</th>
                <th class="p-3 text-left text-sm font-medium">Price per Unit</th>
                <th class="p-3 text-left text-sm font-medium">Sum</th>
                <th class="p-3 text-left text-sm font-medium">Description</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in purchaseOrderStore.selectedPurchaseOrder.items"
                  :key="item.tempId"
                  :class="index % 2 === 1 ? 'bg-[#F7F8FA]' : 'bg-white'"
                  class="hover:bg-[#ECECEC]">
                <td class="p-3 text-center">{{ index + 1 }}</td>
                <td class="p-3 font-medium">{{ item.title }}</td>
                <td class="p-3">{{ item.volume }}</td>
                <td class="p-3">{{ item.unit }}</td>
                <td class="p-3">{{ item.pricePerUnit }}</td>
                <td class="p-3 font-medium text-[#8F2527]">{{ item.pricePerUnit * item.volume }}</td>
                <td class="p-3 text-sm">{{ item.description }}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!purchaseOrderStore.selectedPurchaseOrder.items?.length" class="flex flex-col items-center justify-center py-12 px-4">
            <PackageX :size="32" class="text-[#ADADAD] mb-4" />
            <p class="text-[#838383]">Purchase Order ini tidak memiliki Item</p>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <VButton
            variant="primary"
            size="md"
            @click="goBack"
            class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
            <ArrowLeft :size="16" class="mr-1" />
            Kembali ke list
          </VButton>

          <div class="flex gap-3">
            <VButton
              variant="primary"
              size="md"
              @click="downloadPurchaseOrder"
              :disabled="!purchaseOrderStore.selectedPurchaseOrder"
              class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
              <Download :size="16" class="mr-1" />
              Download PDF
            </VButton>

            <VButton
              @click="() => (showDialog = purchaseOrderStore.selectedPurchaseOrder?.id || null)"
              size="sm"
              variant="delete"
              class="flex items-center bg-[#8F2527] hover:bg-[#3E1011] text-white px-4 py-2 rounded-md border-none transition-colors duration-200">
              <Trash2 :size="16" class="mr-1" />
              Hapus
            </VButton>
          </div>

          <ConfirmationDialog
            :visible="showDialog === purchaseOrderStore.selectedPurchaseOrder?.id"
            title="Hapus Purchase Order"
            message="Apakah Anda yakin ingin menghapus Purchase Order?"
            @confirm="deleteOrder(purchaseOrderStore.selectedPurchaseOrder?.id || 0)"
            @cancel="() => (showDialog = null)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
