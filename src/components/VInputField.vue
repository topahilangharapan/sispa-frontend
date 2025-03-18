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
  maxLength: { type: Number, default: 255 }
});

const emit = defineEmits(['update:modelValue', 'update:hasError']);

const inputValue = ref(props.modelValue || '');

// **Computed untuk format angka dengan thousand separator jika `isNumberOnly` true**
const formattedValue = computed({
  get: () => {
    if (props.isNumberOnly && inputValue.value !== '') {
      return Number(inputValue.value).toLocaleString('us-US'); // Format angka ribuan
    }
    return inputValue.value; // Jika bukan angka, tampilkan biasa
  },
  set: (newValue) => {
    if (props.isNumberOnly) {
      const rawValue = newValue.replace(/\D/g, ''); // Hapus semua karakter kecuali angka
      inputValue.value = rawValue; // Simpan angka tanpa separator
    } else {
      inputValue.value = newValue; // Jika bukan angka, biarkan sesuai input
    }
  }
});

// **Menghitung error**
const errorMessage = computed(() => {
  if (props.isEmpty && !inputValue.value) return 'Field tidak boleh kosong!';
  if (props.isNumberOnly) {
    if (!/^-?\d*$/.test(inputValue.value)) return 'Hanya boleh angka!';
    if (!props.isNegative && Number(inputValue.value) < 0) return 'Nilai tidak boleh negatif!';
  }
  if (props.minLength && inputValue.value.length < props.minLength) return `Minimal ${props.minLength} karakter!`;
  if (props.maxLength && inputValue.value.length > props.maxLength) return `Maksimal ${props.maxLength} karakter!`;
  return '';
});

// **Update ke parent dalam bentuk angka murni jika `isNumberOnly` true**
watch(inputValue, () => {
  const valueToEmit = props.isNumberOnly ? Number(inputValue.value) || 0 : inputValue.value;
  emit('update:modelValue', valueToEmit);
  emit('update:hasError', !!errorMessage.value);
});

// **Prevent non-numeric input jika `isNumberOnly` true**
const preventNonNumeric = (event: KeyboardEvent) => {
  if (props.isNumberOnly) {
    const char = event.key;
    if (!/[\d]/.test(char)) {
      event.preventDefault();
    }
  }
};
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label" class="mb-1 text-black-grey-700 text-semibold">{{ label }}</label>
    <input
      type="text"
      v-model="formattedValue"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-100"
      @keypress="preventNonNumeric"
    />
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>
