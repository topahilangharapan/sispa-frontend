<script setup lang="ts">
import { ref } from 'vue';

const showDropdown = ref(false);

defineProps({
  title: String,
  submodules: Array as () => string[]
});

</script>

<template>
  <div class="fixed top-0 left-64 right-0 h-16 bg-red-400 flex items-center px-6 justify-between">
    <h4 class="text-white-200">{{ title }}</h4>
    <ul class="text-normal text-white-200 flex space-x-4 mt-1">
      <li v-for="submodule in submodules" :key="submodule" class="cursor-pointer hover:text-black-grey-200">{{ submodule }}</li>
    </ul>
    <div class="relative">
      <button @click="showDropdown = !showDropdown" class="text-white-200 text-semibold flex items-center text-m ">
        Nama
        <svg :class="{'rotate-180': showDropdown, 'rotate-0': !showDropdown}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ml-2 w-5 h-5 transition-transform">
        <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />
      </svg>

      </button>
      <transition name="dropdown">
        <div v-if="showDropdown" class="absolute right-0 mt-5 w-48 bg-red-400 overflow-hidden rounded-bl-md rounded-br-md">
          <div class="bg-transparent space-y-2">
            <div class="bg-transparent text-normal text-white-200 p-3 pl-4 cursor-pointer hover:bg-red-300 flex items-center">
              <span>Profil</span>
            </div>
            <div class="bg-transparent text-normal text-white-200 p-3 pl-4 cursor-pointer hover:bg-red-300 flex items-center">
              <span>Pengaturan</span>
            </div>
            <div class="bg-transparent text-normal text-white-200 p-3 pl-4 cursor-pointer hover:bg-red-300 flex items-center">
              <span>Keluar</span>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
