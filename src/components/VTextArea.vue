<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  isEmpty: { type: Boolean, default: false },
  isNegative: { type: Boolean, default: false },
  isNumberOnly: { type: Boolean, default: false },
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 255 },
  disabled: { type: Boolean, default: false },

});

const emit = defineEmits(['update:modelValue', 'update:hasError']);
const inputValue = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || '';
  }
);

// Menghitung error
const errorMessage = computed(() => {
  if (props.isEmpty && !inputValue.value) return 'Field tidak boleh kosong!';
  if (props.isNumberOnly) {
    if (!/^-?\d*$/.test(String(inputValue.value))) return 'Hanya boleh angka!';
    if (!props.isNegative && Number(inputValue.value) < 0) return 'Nilai tidak boleh negatif!';
  }
  if (props.minLength && String(inputValue.value).length < props.minLength) return `Minimal ${props.minLength} karakter!`;
  if (props.maxLength && String(inputValue.value).length > props.maxLength) return `Maksimal ${props.maxLength} karakter!`;
  return '';
});

// Update ke parent
watch(inputValue, () => {
  emit('update:modelValue', inputValue.value);
  emit('update:hasError', !!errorMessage.value);
});

// Mencegah karakter non-angka, kecuali tanda minus (-) hanya di awal
const preventNonNumeric = (event: KeyboardEvent) => {
  const char = event.key;
  if (props.isNumberOnly) {
    if (!/[\d-]/.test(char) || (char === '-' && String(inputValue.value).length > 0)) {
      event.preventDefault();
    }
  }
};
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="mb-1 text-black-grey-700 text-semibold">{{ label }}</label>
    <textarea
      v-model="inputValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :disabled="disabled"
      class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
      @keypress="preventNonNumeric"
    />
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>
