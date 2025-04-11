<template>
  <li class="px-4 py-2 flex items-center cursor-pointer"
      :class="active ? 'bg-black-grey-200 text-white-200 text-bold' : 'text-normal hover:bg-black-grey-200 hover:text-white-200 hover:!font-bold'">
    <i :class="`lucide-${icon} w-5 h-5 mr-2`"></i>
    {{ label }}
  </li>
</template>

<script setup lang="ts">
defineProps({
  icon: String,
  label: String,
  active: Boolean
});
</script>
