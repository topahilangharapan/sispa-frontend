<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth.ts';
import router from '../router';
import VLoading from './VLoading.vue';

// Import icon Lucide yang dibutuhkan
import {
  ShoppingCart,
  FileText,
  Users,
  User,
  LogOut,
  ChevronDown,
  Landmark,
  Package,
  Layers,
  Grid, ReceiptText
} from 'lucide-vue-next'

const showDropdown = ref(false);
const name = ref('');
const authStore = useAuthStore();

const title = ref<Record<string, string>>({});
const submodules = ref<Record<string, string>>({});
const currentModule = ref('');

// Enhanced icon mapping with beautiful icons
const submoduleIcons = {
  'Purchase Order': ShoppingCart,
  'Final Report': FileText,
  'Klien': Users,
  'Invoice': ReceiptText,
  'Cash Flow': Landmark,
  'Vendor': Package,
  'Item': Layers,
  'Pendaftar': Users,
};

// Close dropdown when clicking outside
const closeDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.profile-dropdown') && showDropdown.value) {
    showDropdown.value = false;
  }
};

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
  name.value = authStore.user?.name || '';

  // Set up click listener for closing dropdown
  document.addEventListener('click', closeDropdown);

  updateCurrentPath();
});

// Watch for route changes to update navbar content
watch(
  () => router.currentRoute.value.path,
  () => updateCurrentPath()
);

const updateCurrentPath = () => {
  const path = router.currentRoute.value.path;

  if (path.startsWith('/marketing')) {
    currentModule.value = 'Marketing';
    title.value = { Marketing: '/marketing/purchase-order' };
    submodules.value = {
      'Purchase Order': '/marketing/purchase-order',
      'Final Report': '/marketing/final-report',
      'Klien': '/marketing/client',
    };
  } else if (path.startsWith('/finance')) {
    currentModule.value = 'Keuangan';
    title.value = { Keuangan: '/finance/cash-flow' };
    submodules.value = {
      'Invoice': '/finance/invoice',
      'Cash Flow': '/finance/cash-flow',
    };
  } else if (path.startsWith('/purchasing')) {
    currentModule.value = 'Purchasing';
    title.value = { Purchasing: '/purchasing/vendor' };
    submodules.value = {
      'Vendor': '/purchasing/vendor',
      'Item': '/purchasing/item',
    };
  } else if (path.startsWith('/freelancer')) {
    currentModule.value = 'Freelance';
    title.value = { Freelancer: '/freelancer' };
    submodules.value = {
      'Pendaftar': '/freelancer/applications',
    };
  } else if (path.startsWith('/dashboard')) {
    currentModule.value = 'Dashboard';
    title.value = { Dashboard: '/dashboard' };
    submodules.value = {

    };
  } else if (path.startsWith('/profile')) {
    currentModule.value = 'Profile';
    title.value = { Profile: '/profile' };
    submodules.value = {};
  }
};

const logout = async () => {
  await authStore.logout();
  await router.push('/auth/login');
};

const navigateTo = (url: string) => {
  router.push(url);
};

const isActive = (url: string) => {
  return router.currentRoute.value.path === url;
};
</script>

<template>
  <VLoading v-if="authStore.loading" class="mr-64 fixed inset-0 flex items-center justify-center bg-white bg-opacity-50" />

  <!-- Elegant Navbar with subtle texture and soft gradient -->
  <div v-else class="fixed top-0 left-64 right-0 h-16 bg-white-100 flex items-center justify-between shadow-sm z-10 border-b border-brown-100 border-opacity-20">
    <!-- Main Module Title with elegant styling -->
    <div class="flex items-center h-full">
      <div
        v-if="title && Object.values(title).length"
        @click="navigateTo(Object.values(title)[0])"
        class="h-full flex items-center mx-12  cursor-pointer relative"
      >

        <h4 class="text-red-400 text-2xl font-bold text-lg flex items-center relative">
          {{ title && Object.keys(title).length ? Object.keys(title)[0] : 'Untitled' }}
        </h4>
      </div>

      <!-- Elegant Submodule Navigation -->
      <div class="flex h-full">
        <div v-for="(url, submodule) in submodules" :key="submodule"
             @click="navigateTo(url)"
             class="relative group cursor-pointer h-full flex items-center space-x-6 transition-all duration-300 ease-in-out"
        >
          <div class="flex items-center space-x-2 text-black-grey-700 group-hover:text-brown-400 transition-colors duration-200">
            <!-- Icon sesuai submodule with elegant styling -->
            <component
              v-if="submoduleIcons[submodule as keyof typeof submoduleIcons]"
              :is="submoduleIcons[submodule as keyof typeof submoduleIcons]"
              class="w-4 h-4 transition-colors duration-200"
              :class="[isActive(url) ? 'text-red-200' : 'text-brown-400 group-hover:text-red-200']"
              stroke-width="1.75"
              aria-hidden="true"
            />
            <span
              class="transition-colors duration-200"
              :class="[isActive(url) ? 'text-red-300 font-medium' : 'text-black-grey-600 group-hover:text-red-300']"
            >{{ submodule }}</span>
          </div>

          <!-- Beautiful active indicator dot that grows on hover -->
          <div
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 transition-all duration-300 rounded-t"
            :class="[
              isActive(url) ? 'bg-red-200 w-12' : 'w-0 bg-brown-100 group-hover:w-6'
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Elegant User Profile Dropdown -->
    <div class="relative px-6 profile-dropdown">
      <button
        @click.stop="showDropdown = !showDropdown"
        class="flex items-center space-x-3 py-2 px-4 rounded-full border border-brown-100 border-opacity-30 transition-all duration-300 hover:shadow-sm hover:border-opacity-60 bg-white-300"
      >
        <span class="text-black-grey-700 font-medium">{{ name }}</span>
        <ChevronDown
          :class="{'transform rotate-180': showDropdown}"
          class="text-brown-200 transition-transform duration-300 w-4 h-4"
        />
      </button>

      <!-- Beautiful Dropdown menu with elegant transitions -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="showDropdown" class="absolute right-6 mt-3 w-56 origin-top-right rounded-lg overflow-hidden shadow-lg border border-brown-100 border-opacity-20">
          <div class="bg-white-100 divide-y divide-brown-100 divide-opacity-10">
            <!-- Elegant profile link with hover effect -->
            <router-link to="/profile" class="group flex items-center px-6 py-3 text-black-grey-700 hover:bg-gradient-to-r hover:from-white-300 hover:to-white-100 transition-all duration-200">
              <div class="flex items-center justify-center h-8 w-8 rounded-full bg-white-300 mr-3 group-hover:bg-white-100 transition-colors duration-200">
                <User class="h-4 w-4 text-brown-200 group-hover:text-red-200 transition-colors duration-200" />
              </div>
              <span class="font-medium group-hover:text-red-300 transition-colors duration-200">Profil</span>
            </router-link>

            <!-- Elegant logout button with hover effect -->
            <div @click="logout()" class="group flex items-center px-6 py-3 text-black-grey-700 hover:bg-gradient-to-r hover:from-white-300 hover:to-white-100 cursor-pointer transition-all duration-200">
              <div class="flex items-center justify-center h-8 w-8 rounded-full bg-white-300 mr-3 group-hover:bg-white-100 transition-colors duration-200">
                <LogOut class="h-4 w-4 text-brown-200 group-hover:text-red-200 transition-colors duration-200" />
              </div>
              <span class="font-medium group-hover:text-red-300 transition-colors duration-200">Keluar</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Add subtle texture to enhance aesthetics */
.bg-white-100 {
  background-image: radial-gradient(circle at center, rgba(201, 162, 103, 0.01) 0%, rgba(201, 162, 103, 0) 70%);
  background-size: 20px 20px;
}

/* Smooth transitions for all interactive elements */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
