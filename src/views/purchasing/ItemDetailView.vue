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

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
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
  await itemStatusStore.updateItemStatus(idNumber, selectedStatus.value, authStore.token);
  showUpdateStatusDialog.value = false;
  await itemStore.getItemById(authStore.token, itemId);
  console.log('Payload update status:', {
    itemId: idNumber,
    idItemStatus: selectedStatus.value,
  });
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
});
</script>

<template>
  <VNavbar :title="title" :submodules="submodules" />

  <div v-if="itemStore.loading">
    <VLoading :isDone="!itemStore.loading" />
  </div>

  <div v-else-if="itemStore.currentItem" class="p-8 bg-white-100 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-3xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h2 class="heading-2">Detail Item</h2>
          <div class="flex space-x-2">
            <VButton size="sm" variant="primary" @click="showUpdateStatusDialog = true">
              Update Status
            </VButton>

            <RouterLink :to="`/purchasing/item/${itemId}/update`">
              <VButton size="sm" variant="primary">
                Ubah
              </VButton>
            </RouterLink>

            <VButton @click="() => (showDeleteDialog = true)" size="sm" variant="delete">
              Hapus
            </VButton>

            <ConfirmationDialog
              :visible="showDeleteDialog"
              title="Hapus Item"
              message="Apakah Anda yakin ingin menghapus item?"
              @confirm="deleteItem"
              @cancel="() => (showDeleteDialog = false)"
            />
          </div>
        </div>

        <hr class="border-gray-300 border-t-2 mb-4" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">ID</p>
              <p class="large-text-normal">{{ itemStore.currentItem.id }}</p>
            </div>
            <div>
              <p class="large-text-bold">Unit</p>
              <p class="large-text-normal">{{ itemStore.currentItem.unit }}</p>
            </div>
            <div>
              <p class="large-text-bold">Kategori Item</p>
              <p class="large-text-normal">{{ itemStore.currentItem.category }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">Nama Item</p>
              <p class="large-text-normal">{{ itemStore.currentItem.title }}</p>
            </div>
            <div>
              <p class="large-text-bold">Harga Per Unit</p>
              <p class="large-text-normal">{{ itemStore.currentItem.pricePerUnit }}</p>
            </div>
            <div>
              <p class="large-text-bold">Status</p>
              <p class="large-text-normal">{{ itemStore.currentItem.status }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mt-6">
          <p class="large-text-bold">Deskripsi</p>
          <p class="large-text-normal">{{ itemStore.currentItem.description }}</p>
        </div>

        <!-- Created and Updated -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p class="large-text-bold">Created By</p>
            <p class="large-text-normal">{{ itemStore.currentItem.createdBy }}</p>
          </div>
          <div>
            <p class="large-text-bold">Updated By</p>
            <p class="large-text-normal">{{ itemStore.currentItem.updatedBy }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p class="large-text-bold">Created At</p>
            <p class="large-text-normal">{{ new Date(itemStore.currentItem.createdAt).toLocaleDateString() }}</p>
          </div>
          <div>
            <p class="large-text-bold">Updated At</p>
            <p class="large-text-normal">{{ new Date(itemStore.currentItem.updatedAt).toLocaleDateString() }}</p>
          </div>
        </div>

        <!-- Back Button -->
        <div class="flex justify-center mt-8">
          <VButton
            @click="router.push('/purchasing/item')"
            type="button"
            size="md"
            variant="delete"
            class="bg-slate-600 hover:bg-slate-800 text-white"
          >
            Kembali
          </VButton>
        </div>

        <div v-if="showUpdateStatusDialog" class="fixed inset-0 flex items-center justify-center z-50 bg-gray-200 bg-opacity-50">
          <div class="bg-white p-6 rounded-2xl w-96">
            <h3 class="text-lg font-bold mb-4 text-center">Update Status Item</h3>
            <VDropdown
              v-model="selectedStatus"
              label="Status Item"
              :options="itemStatusOptions"
              placeholder="Pilih status baru"
              :isEmpty="true"
              @update:modelValue="onSelectStatus"
            />

            <div class="flex justify-end space-x-2">
              <VButton size="sm" variant="primary" @click="updateItemStatus" :disabled="!selectedStatus">
                Simpan
              </VButton>
              <VButton size="sm" variant="delete" @click="showUpdateStatusDialog = false">
                Batal
              </VButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
