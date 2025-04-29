<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { DataTable } from 'simple-datatables'
import { useAuthStore } from '../../stores/auth.ts'
import { useCategoryStore } from '../../stores/category.ts'
import VNavbar from '../../components/VNavbar.vue'
import VButton from '../../components/VButton.vue'

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const newCategoryName = ref('')
const dataTableInstance = ref<DataTable | null>(null)
const tableKey = ref(0)

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
  "Item": "/purchasing/item",
  "Kategori": "/purchasing/category"
});

const handleSearch = (event: Event) => {
  const searchValue = (event.target as HTMLInputElement).value
  dataTableInstance.value?.search(searchValue)
}

const fetchCategories = async () => {
  const token = authStore.token
  if (!token) return
  await categoryStore.fetchAll(token)
  await nextTick()
  tableKey.value++
}

const submitCategory = async () => {
  const token = authStore.token
  const trimmedName = newCategoryName.value.trim()
  if (!token || !trimmedName) return

  const success = await categoryStore.create({ name: trimmedName } as any, token)
  if (success) {
    newCategoryName.value = ''
    await fetchCategories()
  }
}

onMounted(async () => {
  if (!authStore.token) return
  await fetchCategories()

  nextTick(() => {
    if (document.getElementById('category-table')) {
      dataTableInstance.value = new DataTable('#category-table', {
        searchable: false,
        sortable: true,
        paging: true,
      })
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-white-100">
    <VNavbar :title="title" :submodules="submodules" />

    <div class="pt-28 px-8 flex gap-8">
      <div class="w-1/3">
        <div class="bg-white p-6 rounded-2xl shadow-lg">
          <h2 class="heading-2 mb-4">Tambah Kategori Barang</h2>
          <form @submit.prevent="submitCategory">
            <div class="mb-4">
              <label class="block mb-2 font-semibold">Nama Kategori</label>
              <input
                v-model="newCategoryName"
                type="text"
                placeholder="Masukkan nama kategori"
                class="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <VButton variant="primary" type="submit">+ Tambah Kategori</VButton>
          </form>
        </div>
      </div>

      <div class="w-2/3">
        <div class="bg-white p-6 rounded-2xl shadow-lg">
          <h2 class="heading-2 mb-4">Daftar Kategori</h2>
          <div class="flex space-x-2 mb-4">
            <input
              type="text"
              placeholder="Cari category..."
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="handleSearch"
            />
          </div>
          <main class="w-full overflow-x-auto">
            <table :key="tableKey" id="category-table" class="w-full">
              <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left">No.</th>
                <th class="px-4 py-2 text-left">Nama Kategori</th>
              </tr>
              </thead>
              <tbody>
              <tr
                v-for="(category, index) in categoryStore.categories"
                :key="category.id"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-2 text-left">{{ index + 1 }}</td>
                <td class="px-4 py-2 text-left">{{ category.name }}</td>
              </tr>
              </tbody>
            </table>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
