<script setup lang="ts">
import VButton from './VButton.vue'
import { AlertTriangle } from 'lucide-vue-next'

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
  <div v-if="props.visible" class="fixed inset-0 flex items-center justify-center z-50">
    <!-- Backdrop overlay -->
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- Dialog box -->
    <div class="bg-white rounded-xl shadow-md max-w-lg w-full z-10 overflow-hidden">
      <div class="p-6 text-center">
        <!-- Centered Icon -->
        <div class="flex justify-center mb-4">
          <AlertTriangle class="text-[#B32225] h-10 w-10" />
        </div>

        <!-- Title -->
        <h2 class="text-[#2E2E2E] text-2xl font-bold mb-4">{{ props.title }}</h2>

        <!-- Message -->
        <p class="text-[#595959] text-base mb-6">{{ props.message }}</p>

        <!-- Centered Buttons -->
        <div class="flex justify-center gap-4">
          <VButton
            @click="onCancel"
            variant="primary"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md"
          >
            Batal
          </VButton>
          <VButton
            @click="onConfirm"
            variant="delete"
            class="bg-[#5D1D1E] hover:bg-[#8F2527] text-white px-6 py-2 rounded-md"
          >
            Hapus
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.v-button) {
  font-weight: 500;
  border: none;
  transition: all 0.2s ease;
}
</style>
