<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCategoryStore } from '../../stores/category'
import VNavbar from '../../components/VNavbar.vue'
import VButton from '../../components/VButton.vue'
import { Search, FolderPlus } from 'lucide-vue-next'
import type { CategoryInterface } from '../../interfaces/category.interface.ts'

const authStore = useAuthStore()
const categoryStore = useCategoryStore()

const title = ref({ 'Purchasing': '/purchasing' })
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
})

const newCategoryName = ref('')
const searchQuery = ref('')
const filteredCategories = ref<CategoryInterface[]>([])
const displayedCategories = ref<CategoryInterface[]>([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredCategories.value = [...categoryStore.categories]
  } else {
    filteredCategories.value = categoryStore.categories.filter(category =>
      category.name.toLowerCase().includes(query)
    )
  }

  totalRows.value = filteredCategories.value.length
  updateDisplayedData()
}

const updateDisplayedData = () => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  displayedCategories.value = filteredCategories.value.slice(start, end)
}

const fetchCategories = async () => {
  const token = authStore.token
  if (!token) return
  await categoryStore.fetchAll(token)
  filteredCategories.value = [...categoryStore.categories]
  totalRows.value = filteredCategories.value.length
  updateDisplayedData()
}

const submitCategory = async () => {
  const token = authStore.token
  const trimmedName = newCategoryName.value.trim()
  if (!token || !trimmedName) return

  const success = await categoryStore.create({ name: trimmedName }, token)
  if (success) {
    newCategoryName.value = ''
    await fetchCategories()
  }
}

onMounted(async () => {
  if (!authStore.token) return
  await fetchCategories()
})
</script>

<template>
  <div class="min-h-screen">
    <VNavbar :title="title" :submodules="submodules" />

    <div class="p-4 md:p-8 min-h-screen">
      <div class="max-w-full mx-auto mt-14">
        <div class="mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-black-grey-800">Kategori Barang</h1>
        </div>

        <div class="flex flex-col md:flex-row gap-6">
          <!-- Form Tambah -->
          <div class="w-full md:w-1/3">
            <div class="bg-white p-6 rounded-xl shadow-lg border border-[#ECECEC]">
              <h2 class="text-xl font-bold mb-4 text-[#2E2E2E]">Tambah Kategori Barang</h2>
              <form @submit.prevent="submitCategory">
                <label class="block mb-2 font-semibold">Nama Kategori</label>
                <input
                  v-model="newCategoryName"
                  type="text"
                  placeholder="Masukkan nama kategori"
                  class="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <VButton variant="primary" type="submit" class="w-full flex items-center justify-center gap-2">
                  <FolderPlus class="h-5 w-5" />
                  Tambah Kategori
                </VButton>
              </form>
            </div>
          </div>

          <!-- Tabel Kategori -->
          <div class="w-full md:w-2/3">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECECEC]">
              <div class="p-5 border-b border-[#ECECEC] bg-gradient-to-r from-white to-[#FCFAFA]">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div class="flex items-center">
                    <div class="p-2 bg-[#FEF6F6] rounded-lg mr-3">
                      <FolderPlus class="h-5 w-5 text-[#8F2527]" />
                    </div>
                    <h2 class="text-xl font-bold text-[#2E2E2E]">Daftar Kategori</h2>
                  </div>
                  <div class="relative">
                    <input
                      type="text"
                      placeholder="Cari kategori..."
                      v-model="searchQuery"
                      @input="handleSearch"
                      class="pl-10 pr-4 py-2.5 border border-[#D8D8D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B32225] bg-[#FCFCFC] text-[#595959] w-full md:w-64"
                    />
                    <Search class="h-4 w-4 text-[#838383] absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <!-- Table Content -->
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                  <tr class="bg-[#F7F8FA] text-[#2E2E2E]">
                    <th class="px-6 py-4 text-center font-semibold">No.</th>
                    <th class="px-6 py-4 text-left font-semibold">Nama Kategori</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                    v-for="(category, index) in displayedCategories"
                    :key="category.id"
                    class="border-t border-[#ECECEC] hover:bg-[#F7F8FA] transition-all duration-150"
                  >
                    <td class="px-6 py-4 text-center text-[#595959] font-medium">
                      {{ ((currentPage - 1) * perPage) + index + 1 }}
                    </td>
                    <td class="px-6 py-4 text-left font-medium text-[#2E2E2E]">
                      {{ category.name }}
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- Custom Pagination in Table Footer -->
              <div class="p-4 border-t border-[#ECECEC] bg-[#FCFCFC]">
                <div class="flex flex-col md:flex-row items-center justify-between gap-3">
                  <!-- Items per page selector -->
                  <div class="flex items-center space-x-2 text-sm text-[#595959]">
                    <span>Tampilkan</span>
                    <select
                      class="px-3 py-1.5 border border-[#D8D8D8] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#B32225] focus:border-transparent"
                      v-model="perPage"
                      @change="(event) => { perPage = parseInt((event.target as HTMLSelectElement).value); currentPage = 1; updateDisplayedData(); }"
                    >
                      <option v-for="n in [5, 10, 15, 20, 50]" :key="n" :value="n">{{ n }}</option>
                    </select>
                    <span>data per halaman</span>
                  </div>

                  <!-- Pagination info -->
                  <div v-if="totalRows > 0" class="text-sm text-[#595959]">
                    Menampilkan {{ ((currentPage - 1) * perPage) + 1 }} sampai {{ Math.min(currentPage * perPage, totalRows) }} dari {{ totalRows }} data
                  </div>

                  <!-- Pagination controls -->
                  <div class="flex items-center space-x-1">
                    <button
                      @click="currentPage--; updateDisplayedData()"
                      :disabled="currentPage === 1"
                      class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
                    >
                      <span class="sr-only">Previous</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    <button
                      v-for="page in Math.ceil(totalRows / perPage)"
                      :key="page"
                      @click="currentPage = page; updateDisplayedData()"
                      class="px-3 py-1.5 border rounded-md transition-colors"
                      :class="page === currentPage
                  ? 'bg-[#8F2527] text-white border-[#8F2527]'
                  : 'border-[#ECECEC] text-[#595959] hover:bg-[#F7F8FA]'"
                    >
                      {{ page }}
                    </button>

                    <button
                      @click="currentPage++; updateDisplayedData()"
                      :disabled="currentPage === Math.ceil(totalRows / perPage) || Math.ceil(totalRows / perPage) === 0"
                      class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
                    >
                      <span class="sr-only">Next</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
