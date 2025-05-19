
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

const emitValue = () => {
  emit('update:modelValue', localValue.value)
}
</script>
<template>
  <div class="flex items-center space-x-2">
    <input
      type="checkbox"
      :id="label"
      v-model="localValue"
      @change="emitValue"
      class="form-checkbox h-5 w-5 text-red-400 focus:ring-red-300 rounded-md border-gray-300"
    />
    <label :for="label" class="text-gray-700 text-sm cursor-pointer">
      {{ label }}
    </label>
  </div>
</template>
