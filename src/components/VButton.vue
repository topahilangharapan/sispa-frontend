<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  type: { type: String as () => 'button' | 'submit' | 'reset', default: 'button' },
  variant: { type: String as () => 'primary' | 'delete' | 'disabled', default: 'primary' },
  size: { type: String as () => 'sm' | 'md' | 'lg', default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const isDisabled = computed(() => props.disabled || props.loading || props.variant === 'disabled');

const buttonClasses = computed(() => {
  const base = 'rounded-lg font-medium transition duration-300 focus:outline-none';
  const sizes: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const variants: Record<'primary' | 'delete' | 'disabled', string> = {
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
