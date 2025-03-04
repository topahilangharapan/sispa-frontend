<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  isDone: Boolean,
  center: { type: Boolean, default: true },
});

const show = computed(() => !props.isDone);
</script>

<template>
  <transition name="fade">
    <div v-if="show" :class="center ? 'ml-64 fixed inset-0 flex items-center justify-center' : 'absolute'" class="z-50">
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 border-4 border-t-transparent border-black-grey-600 rounded-full animate-spin"></div>
        <p class="mt-2 text-black-grey-600 text-normal">Loading...</p>
      </div>
    </div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
