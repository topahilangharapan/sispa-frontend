<script setup lang="ts">
import VNavbar from '../../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../../components/VLoading.vue'
import VButton from '../../components/VButton.vue'
import { useVendorStore } from '../../stores/vendor.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { useRoute } from 'vue-router';
import router from '../../router'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import {
  Building,
  User,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Loader,
  ArrowLeft,
  Trash2,
  PenTool,
  ClipboardList
} from 'lucide-vue-next'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
});

const vendorStore = useVendorStore()
const authStore = useAuthStore()
const route = useRoute();
const vendorId = route.params.id as string;

const showDialog = ref(false);

const isLoaded = ref(false);

const deleteVendor = async () => {
  await vendorStore.deleteVendor(vendorId);
  showDialog.value = false;
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  const token = authStore.token ?? '';
  await vendorStore.getVendorById(token, vendorId)

  isLoaded.value = true;
});

function goBack() {
  router.push('/purchasing/vendor')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 mt-8">
    <VNavbar :title="title" :submodules="submodules" />

    <div v-if="vendorStore.loading" class="w-full flex justify-center mt-8">
      <VLoading :isDone="isLoaded" />
    </div>

    <div v-else-if="vendorStore.currentVendor" class="bg-white w-11/12 max-w-4xl rounded-lg shadow-md mt-8 p-8">
      <div class="flex items-center gap-3 mb-4">
        <FileText class="text-[#8F2527]" :size="24" />
        <h2 class="text-2xl font-bold text-[#3E1011]">Detail Vendor</h2>
      </div>

      <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 my-4"></div>

      <div v-if="vendorStore.loading" class="flex items-center justify-center p-6">
        <Loader :size="24" class="animate-spin text-[#8F2527] mr-2" />
        <span class="text-[#595959]">Loading vendor details...</span>
      </div>

      <div v-if="vendorStore.error" class="flex items-center gap-2 p-4 bg-red-50 text-[#8F2527] rounded-md border-l-4 border-[#B32225] mb-4">
        <AlertCircle :size="18" />
        {{ vendorStore.error }}
      </div>

      <div v-if="vendorStore.currentVendor" class="flex flex-col gap-6">
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">ID Vendor</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
                {{ vendorStore.currentVendor.id }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Layanan</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <ClipboardList :size="14" class="mr-2 text-[#9C804F]" />
                {{ vendorStore.currentVendor.service }}
              </div>
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Vendor</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#3E1011] font-medium">
              {{ vendorStore.currentVendor.name }}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2">
          <Building :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Informasi Kontak</h3>
        </div>

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Kontak</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <Phone :size="14" class="mr-2 text-[#9C804F]" />
              {{ vendorStore.currentVendor.contact }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Email</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <Mail :size="14" class="mr-2 text-[#9C804F]" />
              {{ vendorStore.currentVendor.email }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Alamat</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
              <MapPin :size="14" class="mr-2 text-[#9C804F]" />
              {{ vendorStore.currentVendor.address }}
            </div>
          </div>

          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Deskripsi</span>
            <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
              {{ vendorStore.currentVendor.description }}
            </div>
          </div>
        </div>

<!--        <div class="flex items-center gap-2 mt-2">-->
<!--          <PenTool :size="18" class="text-[#8F2527]" />-->
<!--          <h3 class="text-lg font-semibold text-[#2E2E2E]">Audit Information</h3>-->
<!--        </div>-->

        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Dibuat oleh</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <User :size="14" class="mr-2 text-[#9C804F]" />
                {{ vendorStore.currentVendor.createdBy }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Diperbarui oleh</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <User :size="14" class="mr-2 text-[#9C804F]" />
                {{ vendorStore.currentVendor.updatedBy }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Dibuat pada</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ new Date(vendorStore.currentVendor.createdAt).toLocaleDateString() }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Diperbarui pada</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ new Date(vendorStore.currentVendor.updatedAt).toLocaleDateString() }}
              </div>
            </div>
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
            <RouterLink :to="`/purchasing/vendor/${vendorId}/update`">
              <VButton
                size="sm"
                variant="primary"
                class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
                <PenTool :size="16" class="mr-1" />
                Ubah
              </VButton>
            </RouterLink>

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
            title="Hapus Vendor"
            message="Apakah Anda yakin ingin menghapus vendor?"
            @confirm="deleteVendor"
            @cancel="() => (showDialog = false)"
          />
        </div>
      </div>
    </div>
  </div>
</template>