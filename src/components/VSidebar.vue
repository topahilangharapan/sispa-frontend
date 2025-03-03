<script setup lang="ts">
import VSidebarItem from "./VSidebarItem.vue";
import { useRoute, useRouter } from 'vue-router'

const router = useRouter();
const route = useRoute();

const isActive = (path: string) => route.path === path;
</script>

<template>
  <div class="fixed top-0 left-0 h-full w-64 bg-white-100 flex flex-col shadow-[0_0px_12px_rgba(0,0,0,0.4)]">
    <div class="mt-4 pt-8 pl-12 pr-12 flex items-center justify-center cursor-pointer" @click="router.push('/')">
      <img src="/src/assets/logo_spa_sidebar.png" alt="Logo Sidebar" class="w-full h-16 object-contain" />
    </div>
    <nav class="flex-1 mt-12 overflow-y-auto">
      <ul class="space-y-4">
        <VSidebarItem
          label="Dashboard"
          :active="isActive('/dashboard')"
          @click="router.push('/dashboard')"
        />
        <VSidebarItem
          label="Inventaris"
          :active="isActive('/inventory')"
          @click="router.push('/inventory')"
        />
        <VSidebarItem
          label="Keuangan"
          :active="isActive('/finance')"
          @click="router.push('/finance')"
        />
        <VSidebarItem
          label="Klien"
          :active="isActive('/client')"
          @click="router.push('/client')"
        />
        <VSidebarItem
          label="Vendor"
          :active="isActive('/vendor')"
          @click="router.push('/vendor')"
        />
        <VSidebarItem
          label="Staf dan Freelancer"
          :active="isActive('/staff-freelancer')"
          @click="router.push('/staff-freelancer')"
        />
      </ul>
    </nav>
    <div class="mb-20">
      <ul class="space-y-4">
        <VSidebarItem label="Pengaturan" @click="router.push('/settings')" />
        <VSidebarItem label="Logout" @click="router.push('/logout')" />
      </ul>
    </div>
  </div>
</template>
