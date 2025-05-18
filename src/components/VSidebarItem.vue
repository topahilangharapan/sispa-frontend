<template>
  <li class="px-4 py-2 flex items-center cursor-pointer"
      :class="active ? 'bg-black-grey-200 text-white-200 text-bold' : 'text-normal hover:bg-black-grey-200 hover:text-white-200 hover:!font-bold'">
    <component
      v-if="IconComponent"
      :is="IconComponent"
      class="w-5 h-5 mr-3"
      stroke-width="1.5"
    />
    <span>{{ label }}</span>
  </li>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import {
  LayoutDashboard,
  CreditCard,
  Megaphone,
  ShoppingCart,
  Users,
  UserPlus,
  LogOut
} from 'lucide-vue-next';

const props = defineProps<{
  icon?: string;
  label: string;
  active?: boolean;
}>();

// Map string icon ke komponen Lucide-nya
const iconsMap = {
  'layout-dashboard': LayoutDashboard,
  'credit-card': CreditCard,
  'megaphone': Megaphone,
  'shopping-cart': ShoppingCart,
  'users': Users,
  'user-plus': UserPlus,
  'log-out': LogOut,
};

const IconComponent = computed(() => props.icon ? iconsMap[props.icon as keyof typeof iconsMap] : null);
</script>
