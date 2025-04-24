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
  useThousandSeparator: { type: Boolean, default: false },
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 255 },
  isEmail: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false } // ✅ Tambahkan props disabled
});

const emit = defineEmits(['update:modelValue', 'update:hasError']);

const inputValue = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || '';
  }
);


watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || '';
  }
);

const formattedValue = computed({
  get: () => {
    if (props.type === 'date') return inputValue.value;
    if (props.isNumberOnly && props.useThousandSeparator && inputValue.value !== '') {
      return Number(inputValue.value).toLocaleString('en-US');
    }
    return inputValue.value;
  },
  set: (newValue) => {
    const valueStr = String(newValue);
    if (props.isNumberOnly) {
      inputValue.value = valueStr.replace(/\D/g, '');
    } else {
      inputValue.value = valueStr;
    }
  }
});

const errorMessage = computed(() => {
  if (props.isEmpty && !inputValue.value) return 'Field tidak boleh kosong!';
  if (props.isNumberOnly) {
    if (!/^-?\d*$/.test(String(inputValue.value))) return 'Hanya boleh angka!';
    if (!props.isNegative && Number(inputValue.value) < 0) return 'Nilai tidak boleh negatif!';
  }
  if (props.minLength && String(inputValue.value).length < props.minLength) return `Minimal ${props.minLength} karakter!`;
  if (props.maxLength && String(inputValue.value).length > props.maxLength) return `Maksimal ${props.maxLength} karakter!`;
  if (props.isEmail && inputValue.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputValue.value.toString())) {
      return 'Format email tidak valid!';
    }
  }
  return '';
});

watch(inputValue, () => {
  let valueToEmit: string | number = inputValue.value;

  if (props.type === 'date' && valueToEmit) {
    valueToEmit = new Date(valueToEmit).toISOString().split('T')[0];
  } else if (props.isNumberOnly) {
    valueToEmit = String(valueToEmit);
  }

  emit('update:modelValue', valueToEmit);
  emit('update:hasError', !!errorMessage.value);
});

const preventNonNumeric = (event: KeyboardEvent) => {
  if (props.isNumberOnly) {
    if (!/[\d]/.test(event.key)) {
      event.preventDefault();
    }
  }
};
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="mb-1 text-black-grey-700 text-semibold">{{ label }}</label>
    <input
      :type="type"
      v-model="formattedValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :disabled="disabled"
    class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
    @keypress="preventNonNumeric"
    />
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>
