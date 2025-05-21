<script setup lang="ts">
//Create Item
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
import {
  Package,
  Tag,
  Info,
  Save,
  ArrowLeft,
  Ruler,
  DollarSign
} from 'lucide-vue-next'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
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
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50"></VNavbar>

  <div class="min-h-screen pt-20 pb-12 px-4 md:px-8">
    <!-- Loading state -->
    <VLoading v-if="itemStore.loading" class="flex"/>

    <div v-else class="max-w-5xl mx-auto">
      <div class="max-w-screen-lg mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center space-x-2">
            <button @click="router.push('/purchasing/item')" class="flex items-center text-black-grey-600 hover:text-black-grey-700 transition duration-200">
              <ArrowLeft class="h-4 w-4 mr-1" />
              <span>Kembali</span>
            </button>
          </div>

          <div class="flex flex-col md:flex-row md:items-center justify-between mt-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-black-grey-700 flex items-center">
                <Package size="40" class="mr-4 text-red-200" />
                Tambah Item Baru
              </h1>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white-200 rounded-xl shadow-md overflow-hidden border border-black-grey-175">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-red-300 to-red-200 py-4 px-6">
          <h2 class="text-white-200 text-lg font-medium">Detail Item</h2>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Item Name -->
            <div class="relative">
              <VInputField
                label="Nama Item"
                v-model="itemModel.title"
                placeholder="Masukkan nama item"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('title', $event)"
              />
              <Tag class="absolute right-3 top-9 text-brown-200 w-5 h-5" />
            </div>

            <!-- Unit -->
            <div class="relative">
              <VInputField
                label="Satuan"
                v-model="itemModel.unit"
                placeholder="Masukkan satuan"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('unit', $event)"
              />
              <Ruler class="absolute right-3 top-9 text-brown-200 w-5 h-5" />
            </div>

            <!-- Price Per Unit -->
            <div class="relative">
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
              <DollarSign class="absolute right-3 top-9 text-brown-200 w-5 h-5" />
            </div>

            <!-- Category -->
            <div class="relative">
              <VDropdown
                v-model="itemModel.category"
                label="Kategori"
                :options="itemCategoriesOption"
                placeholder="Silakan pilih kategori"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('category', $event)"
              />
            </div>

            <!-- Description -->
            <div class="md:col-span-2 relative">
              <VTextArea
                label="Deskripsi (Opsional)"
                v-model="itemModel.description"
                placeholder="Masukkan deskripsi jika ada"
              />
              <Info class="absolute right-3 top-9 text-brown-200 w-5 h-5" />
            </div>
          </div>

          <!-- Information text -->
          <div class="mt-4 mb-6">
            <p class="text-sm text-black-grey-400 flex items-center">
              <Info class="w-4 h-4 mr-2" />
              Semua field wajib diisi kecuali deskripsi
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end mt-6">
            <VButton
              variant="primary"
              :disabled="!isFormValid"
              @click="submitItem"
              size="lg"
              class="flex items-center justify-center"
            >
              <Save class="mr-2"/>
              Simpan Item
            </VButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhance component styling */
:deep(.v-input) {
  border-color: #D8D8D8;
  transition: all 0.3s ease;
}

:deep(.v-input:focus-within) {
  border-color: #9C804F;
  box-shadow: 0 0 0 2px rgba(156, 128, 79, 0.1);
}

:deep(.v-dropdown) {
  border-color: #D8D8D8;
  transition: all 0.3s ease;
}

:deep(.v-dropdown:focus-within) {
  border-color: #9C804F;
  box-shadow: 0 0 0 2px rgba(156, 128, 79, 0.1);
}

:deep(.v-textarea) {
  border-color: #D8D8D8;
  transition: all 0.3s ease;
}

:deep(.v-textarea:focus-within) {
  border-color: #9C804F;
  box-shadow: 0 0 0 2px rgba(156, 128, 79, 0.1);
}

:deep(.v-button) {
  transition: all 0.3s ease;
}

:deep(.v-button:disabled) {
  background-color: #ADADAD;
  opacity: 0.7;
}
</style>
