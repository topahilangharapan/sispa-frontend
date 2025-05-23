<script setup lang="ts">
//Final Report List
import { ref, onMounted, computed, watch } from 'vue'
import { useFinalReportStore } from '../../../stores/finalReport.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRouter } from 'vue-router'
import VNavbar from '../../../components/VNavbar.vue'
import VButton from '../../../components/VButton.vue'
import ConfirmationDialog from '../../../components/ConfirmationDialog.vue'
import { Search, FileText, Download, Trash2, Plus, Calendar, Tag, AlertCircle } from 'lucide-vue-next'

const finalReportStore = useFinalReportStore()
const authStore = useAuthStore()
const router = useRouter()
const showDialog = ref<number | null>(null)
const searchQuery = ref('')
const isLoading = ref(true)

// Pagination state
const currentPage = ref(1)
const perPage = ref(10)
const totalRows = ref(0)
const filteredData = ref<any[]>([])
const displayedFinalReports = ref<any[]>([])

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(totalRows.value / perPage.value))
const startRow = computed(() => ((currentPage.value - 1) * perPage.value) + 1)
const endRow = computed(() => Math.min(currentPage.value * perPage.value, totalRows.value))
const displayedPages = computed(() => {
  const pages = []
  const maxPages = 5

  if (totalPages.value <= maxPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate middle pages
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the start
    if (currentPage.value <= 3) {
      endPage = 4
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = totalPages.value - 3
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push('...')
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

onMounted(async () => {
  if (!authStore.token) return

  try {
    isLoading.value = true
    await finalReportStore.fetchAll(authStore.token)

    // Short timeout to ensure DOM is ready
    setTimeout(() => {
      initializeTable()
      isLoading.value = false
    }, 100)
  } catch (error) {
    console.error("Failed to fetch final reports:", error)
    isLoading.value = false
  }
})

// Watch for changes in final report data
watch(() => finalReportStore.finalReports, () => {
  updatePaginationInfo()
  updateDisplayedData()
}, { deep: true })

// Watch for changes in pagination settings
watch([currentPage, perPage], () => {
  updateDisplayedData()
})

const initializeTable = () => {
  totalRows.value = finalReportStore.finalReports.length
  updateDisplayedData()
}

const deleteFinalReport = async (id: number) => {
  try {
    await finalReportStore.deleteFinalReport(id)
    showDialog.value = null
    await finalReportStore.fetchAll(authStore.token || '')
  } catch (error) {
  }
}

const handleSearch = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value
  filterData()
  // Reset to first page when searching
  currentPage.value = 1
  updateDisplayedData()
}

function filterData() {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    filteredData.value = [...finalReportStore.finalReports]
  } else {
    filteredData.value = finalReportStore.finalReports.filter(report => {
      return report.id?.toString().toLowerCase().includes(query) ||
        report.company?.toLowerCase().includes(query) ||
        report.event?.toLowerCase().includes(query)
    })
  }

  totalRows.value = filteredData.value.length
}

function goToDetail(reportId: number) {
  router.push(`/marketing/final-report/${reportId}`)
}

async function downloadFinalReport(id: number, token: string) {
  try {
    await finalReportStore.downloadFinalReport(id, token)
  } catch (error) {
    window.$toast('error', 'Gagal mengunduh laporan akhir!')
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "-"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function refreshData() {
  if (authStore.token) {
    isLoading.value = true
    finalReportStore.fetchAll(authStore.token).finally(() => {
      isLoading.value = false
      // Reset search and pagination state
      searchQuery.value = ''
      currentPage.value = 1
      filterData()
      updateDisplayedData()
    })
  }
}

// Pagination methods
function goToPage(page: number | string) {
  if (page === '...') return
  if (typeof page === 'number') {
    currentPage.value = page
    updateDisplayedData()
  }
}

function updatePerPage(event: Event) {
  const newPerPage = parseInt((event.target as HTMLSelectElement).value)
  perPage.value = newPerPage
  currentPage.value = 1 // Reset to first page when changing items per page
  updateDisplayedData()
}

function updatePaginationInfo() {
  filterData() // Reapply current search filter

  // In case we have fewer rows than expected for the current page
  if (currentPage.value > 1 && startRow.value > totalRows.value) {
    currentPage.value = Math.max(1, Math.ceil(totalRows.value / perPage.value))
  }

  updateDisplayedData()
}

function updateDisplayedData() {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value

  // Use filtered data if there's a search query, otherwise use all data
  const dataSource = searchQuery.value ? filteredData.value : finalReportStore.finalReports

  displayedFinalReports.value = dataSource.slice(start, end)
}
</script>

<template>
  <VNavbar />
  <div class="p-4 md:p-8 min-h-screen">
    <div class="max-w-full mx-auto mt-14">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-black-grey-800">Final Report Dashboard</h1>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-[#ECECEC] transition-all duration-300 hover:shadow-xl">
        <!-- Card Header -->
        <div class="p-5 border-b border-[#ECECEC] bg-gradient-to-r from-white to-[#FCFAFA]">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center">
              <div class="p-2 bg-[#FEF6F6] rounded-lg mr-3">
                <FileText class="h-5 w-5 text-[#8F2527]" />
              </div>
              <h2 class="text-xl font-bold text-[#2E2E2E]">Daftar Final Report</h2>
            </div>

            <div class="flex flex-col md:flex-row gap-3">
              <!-- Search Input -->
              <div class="relative">
                <input
                  type="text"
                  placeholder="Cari laporan akhir..."
                  v-model="searchQuery"
                  @input="handleSearch"
                  class="pl-10 pr-4 py-2.5 border border-[#D8D8D8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B32225] focus:border-transparent w-full md:w-64 text-[#595959] bg-[#FCFCFC] transition-all duration-200"
                />
                <Search class="h-4 w-4 text-[#838383] absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              <!-- Refresh Button -->
              <button
                @click="refreshData"
                class="px-4 py-2.5 rounded-lg border border-[#D8D8D8] bg-white hover:bg-gray-50 text-[#595959] flex items-center justify-center transition duration-200"
                :class="{'animate-spin': isLoading}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
              </button>

              <!-- Add Button -->
              <VButton @click="() => router.push('/marketing/final-report/create')"
                       variant="primary"
                       class="px-4 py-2.5 rounded-lg flex items-center justify-center transition duration-200 shadow-sm">
                <Plus class="h-4 w-4 mr-2" />
                Tambah Final Report
              </VButton>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8F2527]"></div>
          <span class="ml-3 text-[#595959]">Memuat data...</span>
        </div>

        <!-- Table Content -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="bg-[#F7F8FA] text-[#2E2E2E]">
              <th class="px-6 py-4 text-left font-semibold">No.</th>
              <th class="px-6 py-4 text-left font-semibold">Nama Perusahaan</th>
              <th class="px-6 py-4 text-left font-semibold">Nama Acara</th>
              <th class="px-6 py-4 text-left font-semibold">Tanggal Acara</th>
              <th class="px-6 py-4 text-center font-semibold">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(report, index) in displayedFinalReports" :key="report.id"
                class="border-t border-[#ECECEC] hover:bg-[#F7F8FA] transition-all duration-150">
              <td class="px-6 py-4 text-center text-[#595959] font-medium">
                {{ ((currentPage - 1) * perPage) + index + 1 }}
              </td>
              <td class="px-6 py-4 text-left">
                <div class="flex items-center">
                  <div class="p-1.5 bg-[#FEF6F6] rounded-md mr-2">
                    <Tag class="h-4 w-4 text-[#B32225]" />
                  </div>
                  <span class="font-medium text-[#2E2E2E]">{{ report.company }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-left font-medium text-[#2E2E2E]">
                <div class="line-clamp-1 max-w-xs">{{ report.event }}</div>
              </td>
              <td class="px-6 py-4 text-left">
                <div class="flex items-center">
                  <div class="p-1.5 bg-[#F7F3EB] rounded-md mr-2">
                    <Calendar class="h-4 w-4 text-[#9C804F]" />
                  </div>
                  <span class="text-[#595959]">{{ formatDate(report.eventDate) }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center space-x-2">
                  <!-- Detail Button -->
                  <button @click="goToDetail(report.id)"
                          class="flex items-center h-9 justify-center bg-brown-100 text-black-grey-700 hover:bg-brown-200 border-transparent px-3 py-1.5 rounded-md transition duration-200 shadow-sm">
                    <FileText class="h-4 w-4 mr-1" />
                    <span>Detail</span>
                  </button>

                  <!-- Download Button -->
                  <button @click="downloadFinalReport(report.id, authStore.token || '')"
                          class="flex items-center h-9 justify-center bg-[#5D1D1E] hover:bg-[#8F2527] text-white px-3 py-1.5 rounded-md transition duration-200 shadow-sm">
                    <Download class="h-4 w-4 mr-1" />
                    <span>PDF</span>
                  </button>

                  <!-- Delete Button -->
                  <button @click="() => (showDialog = report.id)"
                          class="flex items-center h-9 justify-center bg-[#F7F8FA] hover:bg-[#D8D8D8] text-[#595959] px-3 py-1.5 rounded-md transition duration-200 border border-[#ECECEC]">
                    <Trash2 class="h-4 w-4 text-[#B32225]" />
                  </button>

                  <!-- Confirmation Dialog -->
                  <ConfirmationDialog
                    :visible="showDialog === report.id"
                    title="Hapus Final Report"
                    message="Apakah Anda yakin ingin menghapus Final Report ini? Tindakan ini tidak dapat dibatalkan."
                    @confirm="deleteFinalReport(report.id)"
                    @cancel="() => (showDialog = null)"
                  />
                </div>
              </td>
            </tr>
            <!-- Empty State -->
            <tr v-if="displayedFinalReports.length === 0">
              <td colspan="5" class="px-6 py-16 text-center">
                <div class="mx-auto max-w-md p-6 rounded-xl bg-[#F7F8FA] border border-dashed border-[#D8D8D8]">
                  <AlertCircle class="h-12 w-12 mx-auto mb-3 text-[#B32225]" />
                  <p class="text-lg font-medium text-[#2E2E2E]">{{ searchQuery ? 'Tidak ada data laporan akhir yang sesuai' : 'Belum ada data final report' }}</p>
                  <p class="mt-1 text-[#595959]">{{ searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda' : 'Klik tombol "Tambah Final Report" untuk membuat laporan akhir baru' }}</p>
                  <VButton v-if="!searchQuery" @click="() => router.push('/marketing/final-report/create')"
                           variant="primary"
                           class="mt-4 px-4 py-2 rounded-lg flex items-center justify-center mx-auto">
                    <Plus class="h-4 w-4 mr-2" />
                    Tambah Final Report Baru
                  </VButton>
                  <button v-else @click="() => { searchQuery = ''; handleSearch({ target: { value: '' } } as unknown as Event); }"
                          class="mt-4 px-4 py-2 rounded-lg flex items-center justify-center mx-auto bg-[#8F2527] text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Reset Pencarian
                  </button>
                </div>
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
                @change="updatePerPage($event)"
              >
                <option v-for="n in [5, 10, 15, 20, 50]" :key="n" :value="n">{{ n }}</option>
              </select>
              <span>data per halaman</span>
            </div>

            <!-- Pagination info -->
            <div v-if="totalRows > 0" class="text-sm text-[#595959]">
              Menampilkan {{ startRow }} sampai {{ endRow }} dari {{ totalRows }} data
            </div>

            <!-- Pagination controls -->
            <div class="flex items-center space-x-1">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1.5 border border-[#ECECEC] rounded-md text-[#595959] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F8FA]"
              >
                <span class="sr-only">Previous</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              <button
                v-for="page in displayedPages"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-1.5 border rounded-md transition-colors"
                :class="page === currentPage
                  ? 'bg-[#8F2527] text-white border-[#8F2527]'
                  : 'border-[#ECECEC] text-[#595959] hover:bg-[#F7F8FA]'"
              >
                {{ page }}
              </button>

              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages || totalPages === 0"
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
</template>

<style scoped>
/* No additional custom styles needed */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
