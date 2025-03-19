<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../components/VLoading.vue'
import VButton from '../components/VButton.vue'
import { useVendorStore } from '../stores/vendor.ts'
import { useAuthStore } from '../stores/auth.ts'
import { useRoute } from 'vue-router';
import router from '../router'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
});

const vendorStore = useVendorStore()
const authStore = useAuthStore()
const route = useRoute();
const vendorId = route.params.id as string;

const showDialog = ref(false);

const deleteVendor = async () => {
  await vendorStore.deleteVendor(vendorId);
  showDialog.value = false;
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }

  await vendorStore.getVendorById(authStore.token, vendorId)
});

</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="vendorStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div v-else-if="vendorStore.currentVendor" class="w-full max-w-5xl mb-12 mt-23 ml-53">
    <div class="bg-white p-6 rounded-2xl shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <h2 class="heading-2">Detail Vendor</h2>
        <div class="flex space-x-2">
          <RouterLink :to="`/purchasing/vendor/${vendorId}/update`">
            <VButton size="sm" variant="primary">
              Ubah
            </VButton>
          </RouterLink>
          <VButton @click="() => (showDialog = true)" size="sm" variant="delete">
            Hapus
          </VButton>

          <ConfirmationDialog
            :visible="showDialog"
            title="Hapus Vendor"
            message="Apakah Anda yakin ingin menghapus vendor?"
            @confirm="deleteVendor"
            @cancel="() => (showDialog = false)"
          />
        </div>
      </div>
      <hr class="border-gray-300 border-t-2 mb-4" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <p class="large-text-bold">ID</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.id }}</p>
          </div>
          <div>
            <p class="large-text-bold">Nama</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.name }}</p>
          </div>
          <div>
            <p class="large-text-bold">Layanan</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.service }}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <p class="large-text-bold">Kontak</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.contact }}</p>
          </div>
          <div>
            <p class="large-text-bold">Email</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.email }}</p>
          </div>
          <div>
            <p class="large-text-bold">Alamat</p>
            <p class="large-text-normal">{{ vendorStore.currentVendor.address }}</p>
          </div>
        </div>
      </div>
      <div class="mt-6">
        <p class="large-text-bold">Deskripsi</p>
        <p class="large-text-normal">{{ vendorStore.currentVendor.description }}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <p class="large-text-bold">Created By</p>
          <p class="large-text-normal">{{ vendorStore.currentVendor.createdBy }}</p>
        </div>
        <div>
          <p class="large-text-bold">Updated By</p>
          <p class="large-text-normal">{{ vendorStore.currentVendor.updatedBy }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <p class="large-text-bold">Created At</p>
          <p class="large-text-normal">{{ new Date(vendorStore.currentVendor.createdAt).toLocaleDateString() }}</p>
        </div>
        <div>
          <p class="large-text-bold">Updated At</p>
          <p class="large-text-normal">{{ new Date(vendorStore.currentVendor.updatedAt).toLocaleDateString() }}</p>
        </div>
      </div>
      <div class="flex space-x-2 mt-4">
        <VButton @click="router.back()" type="button" size="sm" variant="delete" class="bg-slate-600 hover:bg-slate-800 text-white">
          Kembali
        </VButton>
      </div>
    </div>
    </div>
</template>
