<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const isDisabled = computed(() => props.disabled || props.loading || props.variant === 'disabled');

const buttonClasses = computed(() => {
  const base = 'rounded-lg font-medium transition duration-300 focus:outline-none';
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };
  const variants = {
    primary: 'bg-brown-100 text-black-grey-700 hover:bg-brown-200',
    delete: 'bg-red-300 text-white hover:bg-red-400',
    disabled: 'bg-black-grey-175 text-black-grey-400'
  };

  return `${base} ${sizes[props.size]} ${variants[props.variant]} ${
    isDisabled.value ? 'cursor-not-allowed opacity-50' : ''
  }`;
});
</script>

<template>
  <button :type="type" :class="buttonClasses" :disabled="isDisabled">
    <slot></slot>
  </button>
</template>
