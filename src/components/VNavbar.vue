<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth.ts';
import router from '../router';
import VLoading from './VLoading.vue';

const showDropdown = ref(false);
const name = ref('');
const authStore = useAuthStore();

defineProps({
  title: Object as () => Record<string, string>, // Title punya format { 'Nama Title': 'URL' }
  submodules: Object as () => Record<string, string>
});

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth));
  }
  name.value = authStore.user.name;
});

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
  <VLoading v-if="authStore.loading" class="mr-64 fixed inset-0 flex items-center justify-center bg-white bg-opacity-50"/>

  <div v-else class="fixed top-0 left-64 right-0 h-16 bg-red-400 flex items-center px-6 justify-between">
    <!-- Container untuk Title & Submodules -->
    <div class="flex items-center space-x-6">
      <h4 @click="navigateTo(Object.values(title)[0])"
          class="text-white cursor-pointer hover:text-gray-300">
        {{ Object.keys(title)[0] }}
      </h4>
      <ul class="text-normal text-white flex space-x-4">
        <li v-for="(url, submodule) in submodules" :key="submodule"
            @click="navigateTo(url)"
            :class="{'text-white font-bold underline': isActive(url), 'hover:text-gray-300': !isActive(url)}"
            class="cursor-pointer">
          {{ submodule }}
        </li>
      </ul>
    </div>

    <div class="relative">
      <button @click="showDropdown = !showDropdown" class="text-white-200 text-semibold flex items-center text-m ">
        {{ name }}
        <svg :class="{'rotate-180': showDropdown, 'rotate-0': !showDropdown}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ml-2 w-5 h-5 transition-transform">
          <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />
        </svg>
      </button>
      <transition name="dropdown">
        <div v-if="showDropdown" class="absolute right-0 mt-5 w-48 bg-red-400 overflow-hidden rounded-bl-md rounded-br-md">
          <div class="bg-transparent space-y-2">
            <router-link to="/profile" class="bg-transparent text-normal text-white-200 p-3 pl-4 cursor-pointer hover:bg-red-300 flex items-center">
              <span>Profil</span>
            </router-link>
            <div @click="logout()" class="bg-transparent text-normal text-white-200 p-3 pl-4 cursor-pointer hover:bg-red-300 flex items-center">
              <span>Keluar</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
