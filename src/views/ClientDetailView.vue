<script setup lang="ts">
import VNavbar from '../components/VNavbar.vue'
import { onMounted, ref } from 'vue'
import VLoading from '../components/VLoading.vue'
import VButton from '../components/VButton.vue'
import { useClientStore } from '../stores/client.ts'
import { useAuthStore } from '../stores/auth.ts'
import { useRoute } from 'vue-router';
import router from '../router'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'

const title = ref("Client");
const submodules = ref([""]);
const clientStore = useClientStore()
const authStore = useAuthStore()
const route = useRoute();
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

  await clientStore.getClientById(authStore.token, clientId)
});

</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <div v-if="clientStore.loading">
    <VLoading :isDone="isLoaded" />
  </div>

  <div v-else-if="clientStore.currentClient" class="w-full max-w-5xl mb-12 mt-23 ml-53">
    <div class="bg-white p-6 rounded-2xl shadow-lg">
      <div class="flex items-center justify-between mb-2">
        <h2 class="heading-2">Detail Client</h2>
        <div class="flex space-x-2">
          <RouterLink :to="`/client/${clientId}/update`">
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
      <div class="flex space-x-2 mt-4">
        <VButton @click="router.back()" type="button" size="sm" variant="delete" class="bg-slate-600 hover:bg-slate-800 text-white">
          Kembali
        </VButton>
      </div>
    </div>
    </div>
</template>
