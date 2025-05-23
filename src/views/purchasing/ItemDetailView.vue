<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useItemStore } from '../../stores/item.ts'
import { useItemStatusStore } from '../../stores/itemStatus.ts'
import { useAuthStore } from '../../stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import VNavbar from '../../components/VNavbar.vue'
import VButton from '../../components/VButton.vue'
import VLoading from '../../components/VLoading.vue'
import VDropdown from '../../components/VDropdown.vue'
import ConfirmationDialog from '../../components/ConfirmationDialog.vue'
import {
  FileText,
  User,
  Calendar,
  ArrowLeft,
  Trash2,
  PenTool,
  Tag,
  DollarSign,
  PackageOpen,
  AlertCircle,
  Loader,
  Info
} from 'lucide-vue-next'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
});

const itemStore = useItemStore()
const itemStatusStore = useItemStatusStore()
const authStore = useAuthStore()
const route = useRoute();
const router = useRouter();
const itemId = route.params.id as string;
const idNumber = Number(route.params.id);
const showDeleteDialog = ref(false);
const showUpdateStatusDialog = ref(false);
const isLoaded = ref(false);

const itemStatusOptions = computed(() => {
  const currentStatus = itemStore.currentItem?.status;
  return itemStatusStore.statuses
    .filter(status => status.name !== currentStatus)
    .map(status => ({
      label: status.name,
      value: status.id,
    }));
});

const selectedStatus = ref<number | null>(null);

const onSelectStatus = (statusId: number) => {
  selectedStatus.value = statusId;
};

const deleteItem = async () => {
  await itemStore.deleteItem(idNumber);
  showDeleteDialog.value = false;
  router.push('/purchasing/item');
};

const updateItemStatus = async () => {
  if (!selectedStatus.value) return;
  await itemStatusStore.updateItemStatus(idNumber, selectedStatus.value, authStore.token!);
  showUpdateStatusDialog.value = false;
  await itemStore.getItemById(authStore.token!, itemId);
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
  if (!authStore.token) {
    console.error('Token tidak tersedia');
    return;
  }
  await itemStore.getItemById(authStore.token, itemId);
  await itemStatusStore.fetchAll(authStore.token);
  isLoaded.value = true;
});

function goBack() {
  router.push('/purchasing/item')
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center py-8 mt-8">
    <VNavbar :title="title" :submodules="submodules" />
    
    <div v-if="itemStore.loading" class="w-full flex justify-center mt-8">
      <VLoading :isDone="isLoaded" />
    </div>
    
    <div v-else-if="itemStore.currentItem" class="bg-white w-11/12 max-w-4xl rounded-lg shadow-md mt-8 p-8">
      <div class="flex items-center gap-3 mb-4">
        <FileText class="text-[#8F2527]" :size="24" />
        <h2 class="text-2xl font-bold text-[#3E1011]">Detail Item</h2>
      </div>
      
      <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 my-4"></div>
      
      <div v-if="itemStore.loading" class="flex items-center justify-center p-6">
        <Loader :size="24" class="animate-spin text-[#8F2527] mr-2" />
        <span class="text-[#595959]">Loading item details...</span>
      </div>
      
      <div v-if="itemStore.error" class="flex items-center gap-2 p-4 bg-red-50 text-[#8F2527] rounded-md border-l-4 border-[#B32225] mb-4">
        <AlertCircle :size="18" />
        {{ itemStore.error }}
      </div>
      
      <div v-if="itemStore.currentItem" class="flex flex-col gap-6">
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">ID</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
                {{ itemStore.currentItem.id }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Nama Item</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#3E1011] font-medium">
                {{ itemStore.currentItem.title }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Unit</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <PackageOpen :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.unit }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Harga Per Unit</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <DollarSign :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.pricePerUnit }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Kategori Item</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Tag :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.category }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Status</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Info :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.status }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2 mt-2">
          <FileText :size="18" class="text-[#8F2527]" />
          <h3 class="text-lg font-semibold text-[#2E2E2E]">Deskripsi</h3>
        </div>
        
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8]">
          <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E]">
            {{ itemStore.currentItem.description }}
          </div>
        </div>
        
        <div class="bg-[#F7F8FA] rounded-lg p-5 border border-[#D8D8D8] flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Dibuat oleh</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <User :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.createdBy }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Diperbarui oleh</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <User :size="14" class="mr-2 text-[#9C804F]" />
                {{ itemStore.currentItem.updatedBy }}
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Dibuat pada</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ new Date(itemStore.currentItem.createdAt).toLocaleDateString() }}
              </div>
            </div>
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-[#595959] block mb-1">Diperbarui pada</span>
              <div class="bg-white p-3 rounded-md border border-[#D8D8D8] text-[#2E2E2E] flex items-center">
                <Calendar :size="14" class="mr-2 text-[#8F2527]" />
                {{ new Date(itemStore.currentItem.updatedAt).toLocaleDateString() }}
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
            <VButton
              size="sm"
              variant="primary"
              @click="showUpdateStatusDialog = true"
              class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
              <Info :size="16" class="mr-1" />
              Update Status
            </VButton>
            
            <RouterLink :to="`/purchasing/item/${itemId}/update`">
              <VButton
                size="sm"
                variant="primary"
                class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
                <PenTool :size="16" class="mr-1" />
                Ubah
              </VButton>
            </RouterLink>
            
            <VButton
              @click="() => (showDeleteDialog = true)"
              size="sm"
              variant="delete"
              class="flex items-center bg-[#8F2527] hover:bg-[#3E1011] text-white px-4 py-2 rounded-md border-none transition-colors duration-200">
              <Trash2 :size="16" class="mr-1" />
              Hapus
            </VButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Update Status Dialog - using fixed positioning with backdrop-blur-md to maintain the blur effect -->
    <div v-if="showUpdateStatusDialog" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96 border border-[#D8D8D8]">
        <div class="flex items-center gap-2 mb-4">
          <Info class="text-[#8F2527]" :size="20" />
          <h3 class="text-lg font-semibold text-[#3E1011]">Update Status Item</h3>
        </div>
        
        <div class="h-px bg-gradient-to-r from-[#C9A267] via-[#8F2527] to-[#C9A267] opacity-60 mb-4"></div>
        
        <div class="mb-4">
          <VDropdown
            v-model="selectedStatus as number"
            label="Status Item"
            :options="itemStatusOptions"
            placeholder="Pilih status baru"
            :isEmpty="true"
            @update:modelValue="onSelectStatus"
          />
        </div>
        
        <div class="flex justify-end space-x-3 mt-4">
          <VButton 
            size="sm" 
            variant="delete" 
            @click="showUpdateStatusDialog = false"
            class="flex items-center bg-[#8F2527] hover:bg-[#3E1011] text-white px-4 py-2 rounded-md border-none transition-colors duration-200">
            Batal
          </VButton>
          <VButton 
            size="sm" 
            variant="primary" 
            @click="updateItemStatus" 
            :disabled="!selectedStatus"
            class="flex items-center bg-[#9C804F] hover:bg-[#483B24] px-5 py-2 rounded-md border-none transition-colors duration-200">
            Simpan
          </VButton>
        </div>
      </div>
    </div>
    
    <ConfirmationDialog
      :visible="showDeleteDialog"
      title="Hapus Item"
      message="Apakah Anda yakin ingin menghapus item?"
      @confirm="deleteItem"
      @cancel="() => (showDeleteDialog = false)"
    />
  </div>
</template>