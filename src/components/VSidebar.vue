<script setup lang="ts">
import VSidebarItem from "./VSidebarItem.vue";
import { useRoute, useRouter } from 'vue-router';
import VLoading from './VLoading.vue';
import { onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/auth.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isActive = (path: string) => route.path === path;

// Daftar menu dengan role yang bisa mengaksesnya
const menuItems = [
  { label: "Dashboard", path: "/dashboard", roles: ["admin", "staff", "inventory", "finance", "hr", "guest", "purchasing"] },
  { label: "Inventaris", path: "/inventory", roles: ["admin", "inventory"] },
  { label: "Keuangan", path: "/finance", roles: ["admin", "finance"] },
  { label: "Marketing", path: "/marketing", roles: ["admin", "staff", "marketing"] },
  // { label: "Klien", path: "/client", roles: ["admin", "staff"] },
  { label: "Purchasing", path: "/purchasing", roles: ["admin", "staff", "purchasing"] },
  { label: "Staf dan Freelancer", path: "/staff-freelancer", roles: ["admin", "hr"] },
];

const settingsItems = [
  { label: "Daftarkan Akun", path: "/auth/register", roles: ["admin"] },
  { label: "Logout", action: () => logout(), roles: ["admin", "staff", "inventory", "finance", "hr", "guest"] },
];

const userRoles = computed(() => authStore.user?.role.toLowerCase() || []);

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
    <div class="mt-4 pt-8 pl-12 pr-12 flex items-center justify-center cursor-pointer" @click="router.push('/')">
      <img src="/src/assets/logo_spa_sidebar.png" alt="Logo Sidebar" class="w-full h-16 object-contain" />
    </div>
    <nav class="flex-1 mt-12 overflow-y-auto">
      <ul class="space-y-4">
        <VSidebarItem
          v-for="item in filteredMenuItems"
          :key="item.path"
          :label="item.label"
          :active="isActive(item.path)"
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
