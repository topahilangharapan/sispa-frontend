<script setup lang="ts">
import VSidebarItem from "./VSidebarItem.vue";
import { useRoute, useRouter } from 'vue-router';
import VLoading from './VLoading.vue';
import { onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = (label: string) => {
  const currentPath = route.path.toLowerCase();

  if (currentPath.startsWith('/marketing')) return label === 'Marketing';
  if (currentPath.startsWith('/dashboard')) return label === 'Dashboard';
  if (currentPath.startsWith('/finance')) return label === 'Keuangan';
  if (currentPath.startsWith('/purchasing')) return label === 'Purchasing';
  if (currentPath.startsWith('/freelancer')) return label === 'Freelancer';

  return false;
};


// Daftar menu dengan role yang bisa mengaksesnya
const menuItems = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "management", "purchasing", "finance", "hr", "marketing"] },
  // { label: "Inventaris", path: "/inventory", roles: ["admin", "management", "purchasing"] },
  { label: "Keuangan", path: "/finance", roles: ["admin","management", "finance"] },
  { label: "Marketing", path: "/marketing/purchase-order", roles: ["admin", "management", "marketing"] },
  { label: "Purchasing", path: "/purchasing/vendor", roles: ["admin", "management", "purchasing"] },
  { label: "Freelancer", path: "/freelancer", roles: ["admin", "management"] },
];

const settingsItems = [
  { label: "Daftarkan Akun", path: "/auth/register", roles: ["admin"] },
  { label: "Logout", action: () => logout(), roles: ["admin", "management", "purchasing", "finance", "hr", "marketing", "freelancer"] },
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
</script>

<template>
  <VLoading v-if="authStore.loading" class="mr-64 fixed inset-0 flex items-center justify-center bg-white bg-opacity-50"/>

  <div v-else class="fixed top-0 left-0 h-full w-64 bg-white-100 flex flex-col shadow-[0_0px_12px_rgba(0,0,0,0.4)]">
    <div class="mt-4 pt-8 pl-12 pr-12 flex items-center justify-center cursor-pointer" @click="router.push('/dashboard')">
      <img src="/src/assets/logo_spa_sidebar.png" alt="Logo Sidebar" class="w-full h-16 object-contain" />
    </div>
    <nav class="flex-1 mt-12 overflow-y-auto">
      <ul class="space-y-4">
        <VSidebarItem
          v-for="item in filteredMenuItems"
          :key="item.path"
          :label="item.label"
          :active="isActive(item.label)"
          @click="router.push(item.path)"
        />
      </ul>
    </nav>
    <div class="mb-20">
      <ul class="space-y-4">
        <VSidebarItem
          v-for="item in filteredSettingsItems"
          :key="item.label"
          :label="item.label"
          @click="item.action ? item.action() : router.push(item.path)"
        />
      </ul>
    </div>
  </div>
</template>
