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
  useThousandSeparator: { type: Boolean, default: false }, // ✅ Tambahkan props ini
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 255 }
});

const emit = defineEmits(['update:modelValue', 'update:hasError']);

const inputValue = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue || '';
  }
)

// **Format angka jika isNumberOnly = true & useThousandSeparator = true & useThousandSeparator = true**
const formattedValue = computed({
  get: () => {
    if (props.type === 'date') return inputValue.value;
    if (props.isNumberOnly && props.useThousandSeparator && inputValue.value !== '') {
      return Number(inputValue.value).toLocaleString('en-US'); // ✅ Gunakan format ribuan jika diaktifkan
    }
    return inputValue.value;
  },
// Pastikan newValue adalah string
  set: (newValue) => {
    const valueStr = String(newValue);
    if (props.isNumberOnly) {
      inputValue.value = valueStr.replace(/\D/g, '');
    } else {
      inputValue.value = valueStr;
    }
  }
});

// **Validasi error**
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

// **Watch perubahan value & emit ke parent**
watch(inputValue, () => {
  let valueToEmit = inputValue.value;
  if (props.type === 'date' && valueToEmit) {
    valueToEmit = new Date(valueToEmit).toISOString().split('T')[0]; // Format YYYY-MM-DD
  } else if (props.isNumberOnly) {
    valueToEmit = Number(inputValue.value) || 0;
  }
  emit('update:modelValue', valueToEmit);
  emit('update:hasError', !!errorMessage.value);
});

// **Prevent non-numeric input jika isNumberOnly true**
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
      class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-100"
      @keypress="preventNonNumeric"
    />
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>