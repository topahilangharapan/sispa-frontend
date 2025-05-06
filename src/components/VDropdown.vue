<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  label: { type: String, default: '' },
  options: { type: Array as () => { value: string | number; label: string }[], default: () => [] },
  availableOptions: { type: Array as () => { value: string | number; label: string }[], default: () => null }, // ✅ baru
  placeholder: { type: String, default: 'Pilih opsi' },
  isEmpty: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  selectionToShow: { type: Number, default: 5 }
});

const emit = defineEmits(['update:modelValue', 'update:hasError']);
const selectedValue = ref<string | number>(props.modelValue !== undefined ? props.modelValue : '');

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined) {
    selectedValue.value = newValue;
  } else {
    selectedValue.value = '';
  }
}, { immediate: true });

const showDropdown = ref(false);

const displayedOptions = computed(() => {
  return Array.isArray(props.availableOptions)
    ? props.availableOptions
    : props.options;
});


const errorMessage = computed(() => {
  if (props.isEmpty && !selectedValue.value) return 'Field tidak boleh kosong!';
  return '';
});

const selectOption = (value: string | number) => {
  selectedValue.value = value;
  showDropdown.value = false;
};

watch(selectedValue, () => {
  emit('update:modelValue', selectedValue.value);
  emit('update:hasError', !!errorMessage.value);
});
</script>

<template>
  <div class="flex flex-col relative">
    <label v-if="label" class="mb-1 text-black-grey-700 text-semibold">{{ label }}</label>
    <div class="relative">
      <div
        class="px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer focus:ring-2 focus:outline-none focus:ring-2 focus:ring-brown-100 bg-transparent backdrop-blur-md transition-all"
        :class="{ 'cursor-not-allowed opacity-50': disabled }"
        @click="!disabled && (showDropdown = !showDropdown)"
        tabindex="0"
        @blur="showDropdown = false"
      >
        <span :class="{ 'text-black-grey-700': selectedValue, 'opacity-60': !selectedValue }">
          {{ selectedValue ? options.find(opt => opt.value === selectedValue)?.label : placeholder }}
        </span>
        <svg :class="{'rotate-180': showDropdown, 'rotate-0': !showDropdown}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ml-2 w-5 h-5 transition-transform">
          <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" />
        </svg>
      </div>
      <transition name="fade-slide">
        <ul
          v-if="showDropdown && !disabled"
          class="absolute left-0 right-0 mt-1 backdrop-blur-3xl border rounded-lg shadow-lg z-10 overflow-y-auto"
          :style="{ maxHeight: `${props.selectionToShow * 40}px` }"
        >
          <li
            v-if="displayedOptions.length === 0"
            class="px-3 py-2 text-gray-500 text-center cursor-default"
          >
            Tidak Ada Data
          </li>
          <li
            v-else
            v-for="option in displayedOptions"
            :key="option.value"
            class="px-3 py-2 hover:bg-black-grey-200/20 cursor-pointer hover:rounded-lg"
            @click="selectOption(option.value)"
          >
            {{ option.label }}
          </li>
        </ul>
      </transition>
    </div>
    <p v-if="errorMessage" class="text-red-175 small-text-normal mt-1">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
