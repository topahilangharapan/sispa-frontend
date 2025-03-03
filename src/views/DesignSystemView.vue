<script setup lang="ts">
import { reactive } from 'vue'

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
</script>

<template>
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
    <div class="w-full max-w-8xl">
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
  </div>
</template>
