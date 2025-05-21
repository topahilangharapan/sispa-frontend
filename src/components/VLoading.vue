<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  isDone: Boolean,
  center: { type: Boolean, default: true },
  isTrueCenter: { type: Boolean, default: false },
});

const show = computed(() => !props.isDone);

const containerClass = computed(() => {
  if (!props.center) return 'absolute';
  return props.isTrueCenter
    ? 'fixed inset-0 flex items-center justify-center'
    : 'ml-64 fixed inset-0 flex items-center justify-center';
});
</script>

<template>
  <transition name="fade">
    <div v-if="show" :class="['z-50', containerClass]">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8F2527]"></div>
        <span class="ml-3 text-[#595959]">Memuat data...</span>
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
