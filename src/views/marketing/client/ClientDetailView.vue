<script setup lang="ts">


import { onMounted, ref } from 'vue'
import { useClientStore } from '../../../stores/client.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRoute, useRouter } from 'vue-router'
import VNavbar from '../../../components/VNavbar.vue'
import VButton from '../../../components/VButton.vue'
import VLoading from '../../../components/VLoading.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Final Report": "/marketing/final-report",
  "Klien": "/marketing/client"
});

const clientStore = useClientStore()
const authStore = useAuthStore()
const route = useRoute();
const router = useRouter();
const clientId = route.params.id as string;

const showDialog = ref(false);

const deleteClient= async () => {
  await clientStore.deleteClient(clientId);
  showDialog.value = false;
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

  await clientStore.getClientById(authStore.token, clientId)
});

</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="clientStore.loading">
    <VLoading :isDone="!clientStore.loading" />
  </div>

  <div v-else-if="clientStore.currentClient" class="p-8 bg-white-100 min-h-screen flex flex-col items-center">
    <div class="w-full max-w-3xl mb-12 mt-16">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <h2 class="heading-2">Detail Klien</h2>
          <div class="flex space-x-2">
            <RouterLink :to="`/marketing/client/${clientId}/update`">
              <VButton size="sm" variant="primary">
                Ubah
              </VButton>
            </RouterLink>
            <VButton @click="() => (showDialog = true)" size="sm" variant="delete">
              Hapus
            </VButton>
  
            <ConfirmationDialog
              :visible="showDialog"
              title="Hapus Klien"
              message="Apakah Anda yakin ingin menghapus klien?"
              @confirm="deleteClient"
              @cancel="() => (showDialog = false)"
            />
  
          </div>
        </div>
        <hr class="border-gray-300 border-t-2 mb-4" />
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">ID</p>
              <p class="large-text-normal">{{ clientStore.currentClient.id }}</p>
            </div>
            <div>
              <p class="large-text-bold">Nama</p>
              <p class="large-text-normal">{{ clientStore.currentClient.name }}</p>
            </div>
            <div>
              <p class="large-text-bold">Industri</p>
              <p class="large-text-normal">{{ clientStore.currentClient.industry }}</p>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <p class="large-text-bold">Kontak</p>
              <p class="large-text-normal">{{ clientStore.currentClient.contact }}</p>
            </div>
            <div>
              <p class="large-text-bold">Email</p>
              <p class="large-text-normal">{{ clientStore.currentClient.email }}</p>
            </div>
            <div>
              <p class="large-text-bold">Alamat</p>
              <p class="large-text-normal">{{ clientStore.currentClient.address }}</p>
            </div>
          </div>
        </div>
        <div class="mt-6">
          <p class="large-text-bold">Deskripsi</p>
          <p class="large-text-normal">{{ clientStore.currentClient.description }}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p class="large-text-bold">Created By</p>
            <p class="large-text-normal">{{ clientStore.currentClient.createdBy }}</p>
          </div>
          <div>
            <p class="large-text-bold">Updated By</p>
            <p class="large-text-normal">{{ clientStore.currentClient.updatedBy }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p class="large-text-bold">Created At</p>
            <p class="large-text-normal">{{ new Date(clientStore.currentClient.createdAt).toLocaleDateString() }}</p>
          </div>
          <div>
            <p class="large-text-bold">Updated At</p>
            <p class="large-text-normal">{{ new Date(clientStore.currentClient.updatedAt).toLocaleDateString() }}</p>
          </div>
        </div>
        <div class="flex justify-center mt-8">
          <VButton 
            @click="router.push('/marketing/client')" 
            type="button" 
            size="md" 
            variant="delete" 
            class="bg-slate-600 hover:bg-slate-800 text-white"
          >
            Kembali
          </VButton>
        </div>
      </div>
    </div>
    </div>
</template>
