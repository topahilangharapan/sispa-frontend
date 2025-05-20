<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import VLoading from './VLoading.vue';
import { onMounted, computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth.ts';
import {
  LayoutDashboard,
  Receipt,
  Megaphone,
  ShoppingBag,
  Users,
  UserPlus,
  LogOut
} from 'lucide-vue-next';

const iconComponents: Record<string, any> = {
  'layout-dashboard': LayoutDashboard,
  'receipt': Receipt,
  'megaphone': Megaphone,
  'shopping-bag': ShoppingBag,
  'users': Users,
  'user-plus': UserPlus,
  'log-out': LogOut
};


const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activeHover = ref('');

const isActive = (label: string) => {
  const currentPath = route.path.toLowerCase();

  if (currentPath.startsWith('/marketing')) return label === 'Marketing';
  if (currentPath.startsWith('/dashboard')) return label === 'Dashboard';
  if (currentPath.startsWith('/finance')) return label === 'Keuangan';
  if (currentPath.startsWith('/purchasing')) return label === 'Purchasing';
  if (currentPath.startsWith('/freelancer')) return label === 'Freelancer';

  return false;
};

// Menu items with improved icons for an event organizer
const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard", roles: ["admin", "management", "purchasing", "finance", "hr", "marketing"] },
  { label: "Keuangan", path: "/finance/invoice", icon: "receipt", roles: ["admin","management", "finance"] },
  { label: "Marketing", path: "/marketing/purchase-order", icon: "megaphone", roles: ["admin", "management", "marketing"] },
  { label: "Purchasing", path: "/purchasing/vendor", icon: "shopping-bag", roles: ["admin", "management", "purchasing"] },
  { label: "Freelancer", path: "/freelancer", icon: "users", roles: ["admin", "management"] },
];

const settingsItems = [
  { label: "Daftarkan Akun", path: "/auth/register", icon: "user-plus", roles: ["admin"] },
  { label: "Logout", icon: "log-out", action: () => logout(), roles: ["admin", "management", "purchasing", "finance", "hr", "marketing", "freelancer"] },
];

const userRoles = computed<string[]>(() => authStore.user?.role?.toLowerCase().split(',') || []);

const filteredMenuItems = computed(() =>
  menuItems.filter(item => item.roles.some(role => userRoles.value.includes(role)))
);

const filteredSettingsItems = computed(() =>
  settingsItems.filter(item => item.roles.some(role => userRoles.value.includes(role)))
);

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
});

const logout = async () => {
  await authStore.logout();
  await router.push('/auth/login');
};

const setActiveHover = (label: string) => {
  activeHover.value = label;
};

const clearActiveHover = () => {
  activeHover.value = '';
};
</script>

<template>
  <VLoading v-if="authStore.loading" class="mr-64 fixed inset-0 flex items-center justify-center bg-white bg-opacity-50"/>

  <div v-else class="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-red-400 to-brown-400 flex flex-col shadow-lg">
    <!-- Logo Section with refined styling -->
    <div class="pt-6 pb-4 pl-6 pr-6 flex items-center justify-center cursor-pointer">
      <div class="rounded-lg p-3 w-full flex justify-center" @click="router.push('/dashboard')">
        <img src="/src/assets/logo_spa_sidebar.png" alt="Logo Sidebar" class="h-14 object-contain" />
      </div>
    </div>

    <!-- Company Name -->
    <div class="text-center mb-6">
      <div class="h-0.5 w-16 bg-brown-100 mx-auto mt-1"></div>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 px-4 overflow-y-auto">
      <ul class="space-y-1">
        <li v-for="item in filteredMenuItems" :key="item.path">
          <div
            @click="router.push(item.path)"
            @mouseenter="setActiveHover(item.label)"
            @mouseleave="clearActiveHover"
            class="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              isActive(item.label)
                ? 'bg-white-100 text-red-400'
                : 'text-white-100 hover:bg-brown-200 hover:bg-opacity-30',
              activeHover === item.label && !isActive(item.label) ? 'bg-brown-200 bg-opacity-20' : ''
            ]"
          >
            <component :is="iconComponents[item.icon]" class="mr-3 h-5 w-5" />
            <span class="font-medium">{{ item.label }}</span>

            <!-- Active indicator line -->
            <div v-if="isActive(item.label)" class="w-1 absolute right-0 h-8 bg-red-200 rounded-l-md"></div>
          </div>
        </li>
      </ul>
    </nav>

    <!-- Settings Section -->
    <div class="mt-auto px-4 mb-6">
      <div class="h-px w-full bg-brown-200 bg-opacity-30 mb-4"></div>
      <ul class="space-y-1">
        <li v-for="item in filteredSettingsItems" :key="item.label">
          <div
            @click="item.action ? item.action() : router.push(item.path)"
            @mouseenter="setActiveHover(item.label)"
            @mouseleave="clearActiveHover"
            class="flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              'text-white-100 hover:bg-brown-200 hover:bg-opacity-30',
              activeHover === item.label ? 'bg-brown-200 bg-opacity-20' : ''
            ]"
          >
            <component :is="iconComponents[item.icon]" class="mr-3 h-5 w-5" />
            <span class="font-medium">{{ item.label }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
