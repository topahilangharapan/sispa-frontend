<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: String,
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Pilih tanggal' },
  disabled: { type: Boolean, default: false },
  minDate: { type: String, default: null },
  maxDate: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue', 'update:hasError']);
const inputValue = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || '';
  }
);

const errorMessage = computed(() => {
  if ((props.minDate || props.maxDate) && inputValue.value) {
    const inputDate = new Date(inputValue.value).setHours(0, 0, 0, 0);
    const minAllowedDate = new Date(props.minDate).setHours(0, 0, 0, 0);
    const maxAllowedDate = new Date(props.maxDate).setHours(0, 0, 0, 0);

    if (inputDate < minAllowedDate) {
      return `Tanggal harus setelah atau sama dengan ${props.minDate}`;
    }

    if (inputDate > maxAllowedDate) {
      return `Tanggal harus sebelum atau sama dengan ${props.maxDate}`;
    }
  }
  return '';
});

watch(inputValue, () => {
  emit('update:modelValue', inputValue.value);
  emit('update:hasError', !!errorMessage.value);
});
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="mb-1 text-black-grey-700 text-semibold">{{ label }}</label>
    <input
      type="date"
      v-model="inputValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
    />
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>
