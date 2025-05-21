<script setup lang="ts" xmlns:h1="http://www.w3.org/1999/html">
import { ref, computed, onMounted, type FunctionalComponent } from 'vue'
import { useRouter } from 'vue-router'
import VNavbar from '../components/VNavbar.vue'
import { useAuthStore } from '../stores/auth.ts'
import {
  Users,
  UserPlus,
  ClipboardList,
  Landmark,
  ReceiptText, Package, Layers, type LucideProps
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const title = ref({ 'Dashboard': '/dashboard' })
const userGreeting = ref('')
const currentTime = ref(new Date())

interface NavItem {
  title: string;
  path: string;
  icon: FunctionalComponent<LucideProps>;
  description: string;
  roles: string[];
}

interface Group {
  title: string;
  items: NavItem[];  // pastikan items ini bertipe NavItem[]
}

// Update time for greeting
const updateTimeAndGreeting = () => {
  currentTime.value = new Date()
  const hours = currentTime.value.getHours()

  if (hours < 12) {
    userGreeting.value = 'Selamat Pagi'
  } else if (hours < 15) {
    userGreeting.value = 'Selamat Siang'
  } else if (hours < 19) {
    userGreeting.value = 'Selamat Sore'
  } else {
    userGreeting.value = 'Selamat Malam'
  }
}

// Enhanced role-based navigation with updated icons and categories
const roleBasedNavigation = ref([
    {
      title: 'Manajemen Arus Kas',
      path: '/finance/cash-flow',
      icon: Landmark,
      description: 'Lihat dan kelola arus kas perusahaan',
      roles: ['finance', 'admin', 'manajemen'],
      category: 'finance'
    },
    {
      title: 'Manajemen Invoice',
      path: '/finance/invoice',
      icon: ReceiptText,
      description: 'Buat dan kelola invoice',
      roles: ['finance', 'admin', 'manajemen'],
      category: 'finance'
    },
    {
      title: 'Manajemen Dokumen',
      path: '/marketing/purchase-order',
      icon: ClipboardList,
      description: 'Buat purchase order dan laporan akhir',
      roles: ['marketing', 'admin', 'manajemen'],
      category: 'marketing'
    },
    {
      title: 'Manajemen Klien',
      path: '/marketing/client',
      icon: UserPlus,
      description: 'Kelola data klien',
      roles: ['marketing', 'admin', 'manajemen'],
      category: 'marketing'
    },
    {
      title: 'Manajemen Vendor',
      path: '/purchasing/vendor',
      icon: Package,
      description: 'Kelola data vendor',
      roles: ['purchasing', 'admin', 'manajemen'],
      category: 'purchasing'
    },
    {
      title: 'Manajemen Inventaris',
      path: '/purchasing/item',
      icon: Layers,
      description: 'Kelola data inventaris barang',
      roles: ['purchasing', 'admin', 'manajemen'],
      category: 'purchasing'
    },
    {
      title: 'Manajemen Freelancer',
      path: '/freelancer',
      icon: Users,
      description: 'Kelola data freelancer',
      roles: ['admin', 'manajemen'],
      category: 'admin'
    },
    {
      title: 'Registrasi User',
      path: '/auth/register',
      icon: UserPlus,
      description: 'Registrasi pengguna sistem',
      roles: ['admin'],
      category: 'admin'
    }
  ]
)

const userRoles = computed<string[]>(() => authStore.user?.role?.toLowerCase().split(',') || [])

const filteredNavigation = computed(() => {
  return roleBasedNavigation.value.filter(navItem =>
    navItem.roles.some(role => userRoles.value.includes(role))
  )
})

// Group navigation cards by category
const groupedNavigation = computed(() => {
  const groups: Record<string, Group> = {
    finance: {
      title: 'Keuangan',
      items: []
    },
    marketing: {
      title: 'Marketing',
      items: []
    },
    purchasing: {
      title: 'Purchasing',
      items: []
    },
    admin: {
      title: 'Manajemen',
      items: []
    }
  }

  filteredNavigation.value.forEach(item => {
    if (groups[item.category as keyof typeof groups]) {
      groups[item.category as keyof typeof groups].items.push(item)
    }
  })

  // Only return groups that have items
  return Object.values(groups).filter(group => group.items.length > 0)
})

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  const savedAuth = localStorage.getItem('auth')
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  updateTimeAndGreeting()

  // Update greeting every minute
  setInterval(updateTimeAndGreeting, 60000)
})
</script>

<template>
  <VNavbar :title="title" />

  <section class="p-4 md:p-8 min-h-screen">
    <!-- Dashboard Header -->
    <div class="mt-14">
      <div class="max-w-full mx-auto">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold">{{ userGreeting }}, {{ authStore.user?.name }}</h1>
            <p class="text-black-grey-600">Selamat datang di Dashboard SiSPA. Apa yang ingin Anda kelola hari ini?</p>
          </div>
          <div class="mt-4 md:mt-0 bg-white-100 rounded-xl px-4 py-2 shadow-sm border border-brown-100 border-opacity-20">
            <div class="text-center">
              <p class="text-black-grey-600 text-sm">{{ currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div>
      <div class="max-w-full mx-auto">
        <!-- Navigation Categories -->
        <div v-for="(group, groupIndex) in groupedNavigation" :key="groupIndex" class="mb-10">
          <div class="mb-4 flex items-center">
            <h2 class="text-xl font-semibold text-brown-400">{{ group.title }}</h2>
            <div class="ml-4 h-px flex-grow bg-brown-100 bg-opacity-20"></div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(nav, index) in group.items"
              :key="index"
              class="group relative overflow-hidden bg-white-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-brown-100 border-opacity-10"
              @click="navigateTo(nav.path)"
            >
              <!-- Accent Color -->
              <div class="absolute top-0 left-0 w-full h-1.5" :class="{
                'bg-red-175': group.title === 'Keuangan',
                'bg-brown-100': group.title === 'Marketing',
                'bg-red-200': group.title === 'Purchasing',
                'bg-brown-200': group.title === 'Manajemen'
              }"></div>

              <div class="p-6 flex items-start gap-5">
                <!-- Icon Container -->
                <div class="min-w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                     :class="{
                    'bg-red-175 bg-opacity-10 text-red-175': group.title === 'Keuangan',
                    'bg-brown-100 bg-opacity-10 text-brown-100': group.title === 'Marketing',
                    'bg-red-200 bg-opacity-10 text-red-200': group.title === 'Purchasing',
                    'bg-brown-200 bg-opacity-10 text-brown-200': group.title === 'Manajemen'
                  }">
                  <!-- Fix #2: Update how the icons are rendered -->
                  <component :is="nav.icon" class="h-6 w-6 text-white" />
                </div>

                <!-- Content -->
                <div class="space-y-1.5">
                  <h3 class="text-lg font-semibold text-black-grey-700 group-hover:text-red-400 transition-colors">
                    {{ nav.title }}
                  </h3>
                  <p class="text-sm text-black-grey-600">{{ nav.description }}</p>
                </div>

                <!-- Hover Indicator -->
                <div class="absolute bottom-0 left-0 h-0.5 bg-brown-100 transition-all duration-300 w-0 group-hover:w-full"></div>
              </div>
            </div>
          </div>
        </div>

<!--        &lt;!&ndash; Quick Stats Section &ndash;&gt;-->
<!--        <div class="mt-12 mb-8">-->
<!--          <div class="mb-4 flex items-center">-->
<!--            <h2 class="text-xl font-semibold text-brown-400">Statistik Ringkas</h2>-->
<!--            <div class="ml-4 h-px flex-grow bg-brown-100 bg-opacity-20"></div>-->
<!--          </div>-->

<!--          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">-->
<!--            &lt;!&ndash; Stat Card 1 &ndash;&gt;-->
<!--            <div class="bg-white-100 rounded-xl p-5 shadow-sm border border-brown-100 border-opacity-10">-->
<!--              <div class="flex justify-between">-->
<!--                <div>-->
<!--                  <p class="text-sm text-black-grey-600">Total Event</p>-->
<!--                  <h4 class="text-2xl font-bold text-black-grey-700 mt-1">24</h4>-->
<!--                </div>-->
<!--                <div class="h-12 w-12 rounded-full bg-red-175 bg-opacity-10 flex items-center justify-center">-->
<!--                  <Briefcase class="h-6 w-6 text-white-100" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="mt-4 flex items-center text-sm">-->
<!--                <span class="text-green-500 flex items-center">-->
<!--                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />-->
<!--                  </svg>-->
<!--                  <span class="ml-1">12%</span>-->
<!--                </span>-->
<!--                <span class="ml-2 text-black-grey-600">dari bulan lalu</span>-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Stat Card 2 &ndash;&gt;-->
<!--            <div class="bg-white-100 rounded-xl p-5 shadow-sm border border-brown-100 border-opacity-10">-->
<!--              <div class="flex justify-between">-->
<!--                <div>-->
<!--                  <p class="text-sm text-black-grey-600">Total Invoice</p>-->
<!--                  <h4 class="text-2xl font-bold text-black-grey-700 mt-1">18</h4>-->
<!--                </div>-->
<!--                <div class="h-12 w-12 rounded-full bg-brown-100 bg-opacity-10 flex items-center justify-center">-->
<!--                  <CreditCard class="h-6 w-6 text-white-100" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="mt-4 flex items-center text-sm">-->
<!--                <span class="text-green-500 flex items-center">-->
<!--                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />-->
<!--                  </svg>-->
<!--                  <span class="ml-1">8%</span>-->
<!--                </span>-->
<!--                <span class="ml-2 text-black-grey-600">dari bulan lalu</span>-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Stat Card 3 &ndash;&gt;-->
<!--            <div class="bg-white-100 rounded-xl p-5 shadow-sm border border-brown-100 border-opacity-10">-->
<!--              <div class="flex justify-between">-->
<!--                <div>-->
<!--                  <p class="text-sm text-black-grey-600">Total Freelancer</p>-->
<!--                  <h4 class="text-2xl font-bold text-black-grey-700 mt-1">36</h4>-->
<!--                </div>-->
<!--                <div class="h-12 w-12 rounded-full bg-red-200 bg-opacity-10 flex items-center justify-center">-->
<!--                  <Users class="h-6 w-6 text-white-100" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="mt-4 flex items-center text-sm">-->
<!--                <span class="text-green-500 flex items-center">-->
<!--                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />-->
<!--                  </svg>-->
<!--                  <span class="ml-1">24%</span>-->
<!--                </span>-->
<!--                <span class="ml-2 text-black-grey-600">dari bulan lalu</span>-->
<!--              </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; Stat Card 4 &ndash;&gt;-->
<!--            <div class="bg-white-100 rounded-xl p-5 shadow-sm border border-brown-100 border-opacity-10">-->
<!--              <div class="flex justify-between">-->
<!--                <div>-->
<!--                  <p class="text-sm text-black-grey-600">Total Inventaris</p>-->
<!--                  <h4 class="text-2xl font-bold text-black-grey-700 mt-1">156</h4>-->
<!--                </div>-->
<!--                <div class="h-12 w-12 rounded-full bg-brown-200 bg-opacity-10 flex items-center justify-center">-->
<!--                  <Archive class="h-6 w-6 text-white-100" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="mt-4 flex items-center text-sm">-->
<!--                <span class="text-red-500 flex items-center">-->
<!--                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />-->
<!--                  </svg>-->
<!--                  <span class="ml-1">3%</span>-->
<!--                </span>-->
<!--                <span class="ml-2 text-black-grey-600">dari bulan lalu</span>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
      </div>
    </div>
  </section>
</template>
