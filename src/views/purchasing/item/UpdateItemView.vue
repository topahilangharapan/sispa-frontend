<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import VNavbar from '../../../components/VNavbar.vue'
import VInputField from '../../../components/VInputField.vue'
import VButton from '../../../components/VButton.vue'
import VTextArea from '../../../components/VTextArea.vue'
import VDropdown from '../../../components/VDropdown.vue'
import VLoading from '../../../components/VLoading.vue'
import { useRouter, useRoute } from 'vue-router'
import { useItemStore } from '../../../stores/item.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { ArrowLeft, FileText, Package, Tag, DollarSign, Layers, ClipboardList, Save } from 'lucide-vue-next'
import type { CreateItemRequestInterface } from '../../../interfaces/item.interface.ts'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
});

const router = useRouter()
const route = useRoute()
const itemStore = useItemStore()
const authStore = useAuthStore()
const itemId = ref('')
const isDataLoaded = ref(false)
const originalTitle = ref('')
const titleChanged = ref(false)
const titleExistsError = ref(false)

const itemCategoriesOption = ref<{ value: string; label: string }[]>([]);

const itemModel = ref<CreateItemRequestInterface>({
  title: "",
  unit: "",
  pricePerUnit: 0,
  description: "",
  category: ""
});

const hasErrors = ref({
  title: false,
  unit: false,
  pricePerUnit: false,
  category: false,
  description: false
})

watch(() => itemModel.value.title, async (newVal) => {
  if (isDataLoaded.value && newVal !== originalTitle.value) {
    titleChanged.value = true
    
    if (newVal.trim() !== '') {
      titleExistsError.value = false 
    } else {
      titleExistsError.value = false
    }
  } else {
    titleChanged.value = false
    titleExistsError.value = false
  }
})

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')
  itemId.value = route.params.id as string
  
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
  
  if (itemId.value) {
    await itemStore.getItemById(authStore.token, itemId.value);
    if (itemStore.currentItem) {
      itemModel.value = {
        title: itemStore.currentItem.title,
        unit: itemStore.currentItem.unit,
        pricePerUnit: itemStore.currentItem.pricePerUnit,
        description: itemStore.currentItem.description,
        category: itemStore.currentItem.category
      };
      
      originalTitle.value = itemStore.currentItem.title
      isDataLoaded.value = true
    }
  }
});

const updateErrorStatus = (field: keyof typeof hasErrors.value, isError: boolean) => {
  hasErrors.value[field] = isError
}

const isFormValid = computed(() => {
  const baseValid = Object.values(hasErrors.value).every(error => !error);
  return baseValid && !titleExistsError.value;
})

const submitItem = async () => {
  if (!isFormValid.value) {
    if (titleExistsError.value) {
      window.$toast('error', 'Nama item sudah digunakan!');
    }
    return;
  }
  
  if (!itemModel.value.description.trim()) itemModel.value.description = "-";
  
  if (!authStore.token) {
    throw new Error('Token is missing');
  }
  
  try {
    const success = await itemStore.updateItem(itemModel.value, itemId.value, authStore.token);
    if (success) {
      await router.push(`/purchasing/item/${itemId.value}`);
    }
  } catch (error) {
    console.error('Error during submit:', error);
  } finally {
    authStore.loading = false;
  }
}




</script>

<template>
  <VNavbar :title="title" :submodules="submodules" class="fixed top-0 left-0 w-full z-50"></VNavbar>
  
  <div class="min-h-screen pt-20 pb-12 px-4 md:px-8">
    <!-- Loading state -->
    <VLoading v-if="authStore.loading || itemStore.loading" class="flex"/>
    
    <div v-else class="max-w-5xl mx-auto">
      <div class="max-w-screen-lg mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center space-x-2">
            <button @click="router.back()" class="flex items-center text-[#595959] hover:text-[#2E2E2E] transition duration-200">
              <ArrowLeft class="h-4 w-4 mr-1" />
              <span>Kembali</span>
            </button>
          </div>
          <div class="flex flex-col md:flex-row md:items-center justify-between mt-4">
            <div>
              <h1 class="text-2xl md:text-3xl font-bold text-[#2E2E2E] flex items-center">
                <FileText :size="50" class="mr-4 text-[#B32225]" />
                Update Item
              </h1>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden border border-[#D8D8D8]">
        <!-- Card Header -->
        <div class="bg-gradient-to-r from-[#5D1D1E] to-[#8F2527] py-4 px-6">
          <h2 class="text-[#FFFFFF] text-lg font-medium">Detail Item</h2>
        </div>
        
        <!-- Form Content -->
        <div class="p-6">
          <form @submit.prevent="submitItem">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title -->
              <div class="relative">
                <VInputField
                  v-model="itemModel.title"
                  label="Nama"
                  placeholder="Masukkan nama item"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('title', $event)"
                />
                <Package class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
                <p v-if="titleExistsError" class="text-red-500 text-sm mt-1">
                  Nama item sudah digunakan.
                </p>
              </div>
              
              <!-- Unit -->
              <div class="relative">
                <VInputField
                  v-model="itemModel.unit"
                  label="Satuan"
                  placeholder="Masukkan satuan"
                  :isEmpty="true"
                  @update:hasError="updateErrorStatus('unit', $event)"
                />
                <Tag class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
              </div>
              
              <!-- Price Per Unit -->
              <div class="relative">
                <VInputField
                  v-model="itemModel.pricePerUnit"
                  label="Harga per Satuan"
                  placeholder="Masukkan harga per satuan"
                  :isEmpty="true"
                  :isNumberOnly="true"
                  :isNegative="false"
                  :useThousandSeparator="true"
                  @update:hasError="updateErrorStatus('pricePerUnit', $event)"
                />
                <DollarSign class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
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
                <Layers class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
              </div>
            </div>
            
            <!-- Description -->
            <div class="mt-6 relative">
              <VTextArea
                v-model="itemModel.description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi jika ada"
                :isEmpty="false"
                @update:hasError="updateErrorStatus('description', $event)"
              />
              <ClipboardList class="absolute right-3 top-9 text-[#9C804F] w-5 h-5" />
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-end mt-8">
              <VButton
                variant="primary"
                @click="submitItem"
                :disabled="!isFormValid"
                size="lg"
                class="flex items-center justify-center"
              >
                <Save class="mr-2"/>
                Update
              </VButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.v-input) {
  border-color: #D8D8D8;
  transition: all 0.3s ease;
}
:deep(.v-input:focus-within) {
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