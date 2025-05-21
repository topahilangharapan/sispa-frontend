
<script setup lang="ts">
import { useInvoiceStore } from '../../../stores/invoice.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import {
  FileText,
  AlertCircle,
  Loader,
  Landmark,
  Building2,
  CreditCard,
  User,
  MapPin,
  Calendar,
  PenTool,
  ShoppingBag,
  PackageX,
  ArrowLeft,
  Trash2
} from 'lucide-vue-next'
import VButton from '../../../components/VButton.vue'
import VNavbar from '../../../components/VNavbar.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const showDialog = ref(false);
const invoiceId = Number(route.params.id) || 0;

onMounted(async () => {
  if (!authStore.token) {
    return
  }
  await invoiceStore.fetchDetail(invoiceId, authStore.token)
  console.log("Selected Invoice:", invoiceStore.selectedInvoice)
})

function goBack() {
  router.push('/finance/invoice')
}

const deleteInvoice = async () => {
  await invoiceStore.deleteInvoice(invoiceId, authStore.token || '');
  showDialog.value = false;
  router.push('/finance/invoice')
}
</script>


<template>
  <div class="min-h-screen flex flex-col items-center py-8 mt-8">
    <VNavbar />

    <div class="bg-white w-11/12 max-w-4xl rounded-lg shadow-md mt-8 p-8">
      <div class="flex items-center gap-3 mb-4">
        <FileText class="text-[#8F2527]" :size="24" />
        <h2 class="text-2xl font-bold text-[#3E1011]">Invoice Details</h2>
      </div>

      <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 my-4"></div>

      <div v-if="invoiceStore.loading" class="flex items-center justify-center p-6">
        <Loader :size="24" class="animate-spin text-[#8F2527] mr-2" />
        <span class="text-[#595959]">Loading invoice details...</span>
      </div>

      <div v-if="invoiceStore.error" class="flex items-center gap-2 p-4 bg-red-50 text-[#8F2527] rounded-md border-l-4 border-[#B32225] mb-4">
        <AlertCircle :size="18" />
        {{ invoiceStore.error }}
      </div>

      <div v-if="invoiceStore.selectedInvoice" class="flex flex-col gap-6">
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">No. Invoice</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
                {{ invoiceStore.selectedInvoice.noInvoice }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">No. PO</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
                {{ invoiceStore.selectedInvoice.noPo }}
              </div>
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Diperuntukkan</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#3E1011] font-medium">
              {{ invoiceStore.selectedInvoice.receiver }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <Landmark :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Payment Information</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Persentase PPn</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
              {{ invoiceStore.selectedInvoice.ppnPercentage }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Bank</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <Building2 :size="14" class="mr-2 text-[#9C804F]" />
              {{ invoiceStore.selectedInvoice.bankName }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nomor Rekening</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <CreditCard :size="14" class="mr-2 text-[#9C804F]" />
              {{ invoiceStore.selectedInvoice.accountNumber }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Rekening (a.n.)</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <User :size="14" class="mr-2 text-[#9C804F]" />
              {{ invoiceStore.selectedInvoice.onBehalf }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <PenTool :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Signature Details</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Ditandatangani Oleh</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
              {{ invoiceStore.selectedInvoice.signee }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Ditandatangani di</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <MapPin :size="14" class="mr-2 text-[#8F2527]" />
                {{ invoiceStore.selectedInvoice.placeSigned }}
              </div>
            </div>

            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Ditandatangani pada</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ invoiceStore.selectedInvoice.dateSigned }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <ShoppingBag :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Invoice Items</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg border border-[#D8D8D8] overflow-hidden">
          <div class="overflow-x-auto">
            <table v-if="invoiceStore.selectedInvoice.items?.length" class="w-full border-collapse">
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
              <tr v-for="(item, index) in invoiceStore.selectedInvoice.items"
                  :key="item.id"
                  :class="index % 2 === 1 ? 'bg-[#F7F8FA]' : 'bg-white'"
                  class="hover:bg-[#ECECEC]">
                <td class="p-3 text-center">{{ index + 1 }}</td>
                <td class="p-3 font-medium">{{ item.title }}</td>
                <td class="p-3">{{ item.volume }}</td>
                <td class="p-3">{{ item.unit }}</td>
                <td class="p-3">{{ item.pricePerUnit }}</td>
                <td class="p-3 font-medium text-[#8F2527]">{{ item.sum }}</td>
                <td class="p-3 text-sm">{{ item.description }}</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!invoiceStore.selectedInvoice.items?.length" class="flex flex-col items-center justify-center py-12 px-4">
            <PackageX :size="32" class="text-[#ADADAD] mb-4" />
            <p class="text-[#838383]">No items in this invoice</p>
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

          <VButton
            @click="() => (showDialog = true)"
            size="sm"
            variant="delete"
            class="flex items-center bg-[#8F2527] hover:bg-[#3E1011] text-white px-4 py-2 rounded-md border-none transition-colors duration-200">
            <Trash2 :size="16" class="mr-1" />
            Hapus
          </VButton>

          <ConfirmationDialog
            :visible="showDialog"
            title="Hapus Invoice"
            message="Apakah Anda yakin ingin menghapus Invoice?"
            @confirm="deleteInvoice"
            @cancel="() => (showDialog = false)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
