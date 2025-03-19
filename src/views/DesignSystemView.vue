<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import VInputField from '../components/VInputField.vue'
import VButton from '../components/VButton.vue'
import VDropdown from '../components/VDropdown.vue'
import VLoading from '../components/VLoading.vue'
import { usePurchaseOrderStore } from '../stores/purchaseOrder.ts'

const colors = reactive({
  'Red 400': { bg: 'bg-red-400', text: 'text-white' },
  'Red 300': { bg: 'bg-red-300', text: 'text-white' },
  'Red 200': { bg: 'bg-red-200', text: 'text-white' },
  'Red 175': { bg: 'bg-red-175', text: 'text-white' },
  'Brown 400': { bg: 'bg-brown-400', text: 'text-white' },
  'Brown 200': { bg: 'bg-brown-200', text: 'text-black' },
  'Brown 100': { bg: 'bg-brown-100', text: 'text-black' },
  'Black Grey 800': { bg: 'bg-black-grey-800', text: 'text-white' },
  'Black Grey 700': { bg: 'bg-black-grey-700', text: 'text-white' },
  'Black Grey 600': { bg: 'bg-black-grey-600', text: 'text-white' },
  'Black Grey 400': { bg: 'bg-black-grey-400', text: 'text-black' },
  'Black Grey 200': { bg: 'bg-black-grey-200', text: 'text-black' },
  'Black Grey 175': { bg: 'bg-black-grey-175', text: 'text-black' },
  'White 400': { bg: 'bg-white-400', text: 'text-black' },
  'White 300': { bg: 'bg-white-300', text: 'text-black' },
  'White 200': { bg: 'bg-white-200', text: 'text-black' },
  'White 100': { bg: 'bg-white-100', text: 'text-black' },
})

const hasErrors = ref({
  noInput: true,
  numberOnly: false,
  positiveNumberOnly: false,
  minLength: true,
  maxLength: false,
  role: true
});

// Fungsi untuk update status error tiap input
const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

// Tombol bisa ditekan jika semua input tidak error
const isFormValid = computed(() => {
  return Object.values(hasErrors.value).every(error => error === false);
});

const successToast = () => {
  window.$toast('success', 'Ini contoh Success Toast!');
};

const errorToast = () => {
  window.$toast('error', 'Ini contoh Error Toast!');
};

const infoToast = () => {
  window.$toast('info', 'Ini contoh Info Toast!');
};

const options = [
  { value: 'option1', label: 'Opsi 1' },
  { value: 'option2', label: 'Opsi 2' },
  { value: 'option3', label: 'Opsi 3' }
];

const selectedOptions = ref('')
</script>

<template>
<!--  <VLoading :isDone="usePurchaseOrderStore.loading" />-->
  <div class="p-8 bg-white-100 min-h-screen flex flex-col items-center">
    <h1 class="text-center mb-8 heading-1">Design System Preview</h1>

    <!-- Typography Preview -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Typography</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h1 class="heading-1">Main Header (H1)</h1>
            <h2 class="heading-2">Section Header (H2)</h2>
            <h3 class="heading-3">Subheader (H3)</h3>
            <h4 class="heading-4">Title (H4)</h4>
          </div>
          <div>
            <p class="large-text-bold">Large Text Bold</p>
            <p class="large-text-semibold">Large Text Semibold</p>
            <p class="large-text-normal">Large Text Normal</p>
            <p class="text-bold">Text Bold</p>
            <p class="text-semibold">Text Semibold</p>
            <p class="text-normal">Text Normal</p>
            <p class="small-text-bold">Small Text Bold</p>
            <p class="small-text-semibold">Small Text Semibold</p>
            <p class="small-text-normal">Small Text Normal</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Palette Preview -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Color Palette</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            v-for="(color, name) in colors"
            :key="name"
            class="p-4 rounded-lg shadow-md text-center"
            :class="color.bg"
          >
            <p :class="color.text" class="font-semibold">{{ name }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Field Preview -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Input Field</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <VInputField
              v-model="inputValue"
              label="No Empty Input"
              placeholder="Enter text here"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('noInput', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="inputValue"
              label="Number Only"
              placeholder="Enter numbers"
              :isNumberOnly="true"
              @update:hasError="updateErrorStatus('numberOnly', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="inputValue"
              label="Number and Use Thousand Separator"
              placeholder="Enter numbers"
              :isNumberOnly="true"
              :useThousandSeparator="true"
              @update:hasError="updateErrorStatus('numberOnly', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="inputValue"
              label="Positive Number Only"
              placeholder="Enter numbers"
              :isNumberOnly="true"
              :isNegative="false"
              @update:hasError="updateErrorStatus('positiveNumberOnly', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="inputValue"
              label="Min-Length"
              placeholder="Enter text here"
              :minLength="5"
              @update:hasError="updateErrorStatus('minLength', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="inputValue"
              label="Max-Length"
              placeholder="Enter text here"
              :maxLength="5"
              @update:hasError="updateErrorStatus('maxLength', $event)"
            />
          </div>
          <div class="flex items-center justify-end mt-4 h-16">
            <div class="text-normal text-black-grey-700">
              Masih terdapat error = {{ !isFormValid }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dropdown Preview -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Dropdown</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <VDropdown
              v-model="selectedOptions"
              label="Pilih Opsi"
              :options="options"
              placeholder="Silakan pilih"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('role', $event)"
            />
          </div>

          <div class="flex items-center justify-end mt-4 h-16">
            <div class="text-normal text-black-grey-700">
              Masih terdapat error = {{ !isFormValid }}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Button Section -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Button</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />

        <div class="grid grid-cols-3 gap-4 mt-6 place-items-center">
          <VButton variant="primary" size="sm">Small</VButton>
          <VButton variant="primary" size="md">Medium</VButton>
          <VButton variant="primary" size="lg">Large</VButton>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-4 place-items-center">
          <VButton variant="delete" size="sm">Delete Small</VButton>
          <VButton variant="delete" size="md">Delete Medium</VButton>
          <VButton variant="delete" size="lg">Delete Large</VButton>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-4 place-items-center">
          <VButton variant="disabled" size="sm" disabled>Disabled Small</VButton>
          <VButton variant="disabled" size="md" disabled>Disabled Medium</VButton>
          <VButton variant="disabled" size="lg" disabled>Disabled Large</VButton>
        </div>

        <div class="flex justify-center mt-6">
          <VButton variant="primary" size="md" :disabled="!isFormValid">
            Submit
          </VButton>
        </div>
      </div>
    </div>

    <!-- Toast Section -->
    <div class="w-full max-w-8xl mb-12">
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="mb-2 heading-2">Toast</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />

        <div class="grid grid-cols-3 gap-4 mt-6 place-items-center">
          <VButton @click="successToast" variant="primary" class="bg-green-700 text-white-100 hover:bg-green-500" size="md">Success</VButton>
          <VButton @click="errorToast" variant="primary" class="bg-red-200 text-white-100 hover:bg-red-175" size="md">Error</VButton>
          <VButton @click="infoToast" variant="primary" class="bg-brown-200 text-white-100 hover:bg-yellow-700" size="md">Info</VButton>
        </div>
      </div>
    </div>
  </div>
</template>
