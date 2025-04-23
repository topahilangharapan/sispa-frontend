<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VNavbar from '../../../components/VNavbar.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'
import VTextArea from '../../../components/VTextArea.vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '../../../stores/item.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import VDropdown from '../../../components/VDropdown.vue'
import VLoading from '../../../components/VLoading.vue'
import type { CreateItemRequestInterface } from '../../../interfaces/item.interface.ts'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
});

const router = useRouter()
const itemStore = useItemStore()
const authStore = useAuthStore()

const itemCategoriesOption = ref<{ value: string; label: string }[]>([]);

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  if (!authStore.token) {
    console.error("Token tidak tersedia");
    return;
  }

  await itemStore.getItemCategories(authStore.token)

  if (itemStore.itemCategories) {
    itemCategoriesOption.value = itemStore.itemCategories.map(category => ({
      value: String(category.name),
      label: String(category.name),
    }));
  }
});

const itemModel = ref<CreateItemRequestInterface>({
  title: "",
  unit: "",
  pricePerUnit: 0,
  description: "",
  category: ""
});

const hasErrors = ref({
  title: true,
  unit: true,
  pricePerUnit: true,
  category: true,
})

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError
}

const isFormValid = computed(() => Object.values(hasErrors.value).every(e => !e))

const submitItem = async () => {

  if (!itemModel.value.description.trim()) itemModel.value.description = "-";

  if (!authStore.token) {
    throw new Error('Token is missing');
  }

  const success = await itemStore.create(itemModel.value, authStore.token);

  if (success) {
    await router.push('/purchasing/item');
  }
}
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <VLoading v-if="itemStore.loading" class="flex"/>

  <div v-else class="p-8 mt-12 w-full min-h-screen">
    <h2 class="mb-6">Tambah Item</h2>

    <div class="bg-white p-6 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VInputField
          label="Nama"
          v-model="itemModel.title"
          placeholder="Masukkan nama item"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('title', $event)"
        />

        <VInputField
          label="Satuan"
          v-model="itemModel.unit"
          placeholder="Masukkan satuan"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('unit', $event)"
        />

        <VInputField
          label="Harga per Satuan"
          v-model="itemModel.pricePerUnit"
          placeholder="Masukkan harga per satuan"
          :isEmpty="true"
          :isNumberOnly="true"
          :isNegative="false"
          :useThousandSeparator="true"
          @update:hasError="updateErrorStatus('pricePerUnit', $event)"
        />

        <VDropdown
          v-model="itemModel.category"
          label="Kategori"
          :options="itemCategoriesOption"
          placeholder="Silakan pilih kategori"
          :isEmpty="true"
          @update:hasError="updateErrorStatus('category', $event)"
        />


        <VTextArea
          class="md:col-span-2"
          label="Deskripsi (Opsional)"
          v-model="itemModel.description"
          placeholder="Masukkan deskripsi jika ada"
        />
      </div>

      <div class="flex justify-end mt-6">
        <VButton
          variant="primary"
          :disabled="!isFormValid"
          @click="submitItem"
          size="lg"
        >
          Simpan Item
        </VButton>
      </div>
    </div>
  </div>
</template>
