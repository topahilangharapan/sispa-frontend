<script setup lang="ts">
import VButton from './VButton.vue'
const props = defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
});
const emits = defineEmits(["confirm", "cancel"]);
const onConfirm = () => emits("confirm");
const onCancel = () => emits("cancel");
</script>
<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50"></div>
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full z-10">
      <h3 class="text-lg font-bold mb-4">{{ title }}</h3>
      <p class="text-gray-700 mb-6">{{ message }}</p>
      <div class="flex justify-end gap-4">
        <VButton @click="onCancel" variant="primary" size="md">
          Batal
        </VButton>
        <VButton @click="onConfirm" variant="delete" size="md">
          Hapus
        </VButton>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
