<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  maxSize: { type: Number, default: 5 * 1024 * 1024 }, // Maksimum 5MB
  maxImages: { type: Number, default: 3 }, // Maksimum 3 gambar
  minImages: { type: Number, default: 1 }, // Minimum 1 gambar
  aspectRatio: { type: String, default: '1:1' },
  allowedTypes: { type: Array as () => string[], default: () => ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'] }, // Format yang diizinkan
});

const emit = defineEmits(['update:files', 'update:hasError']);

const files = ref<File[]>([]);
const errors = ref<string[]>([]);
const isProcessing = ref(false);

// Hitung error setelah validasi selesai
const hasError = computed(() => !isProcessing.value && files.value.length < props.minImages);

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const selectedFiles = Array.from(input.files);
  errors.value = [];
  isProcessing.value = true;

  if (files.value.length + selectedFiles.length > props.maxImages) {
    errors.value.push(`Maksimal ${props.maxImages} gambar.`);
    isProcessing.value = false;
    return;
  }

  for (const file of selectedFiles) {
    // Validasi ukuran file
    if (file.size > props.maxSize) {
      errors.value.push(`${file.name} terlalu besar (maksimal ${(props.maxSize / 1024 / 1024).toFixed(1)}MB).`);
      continue;
    }

    // Validasi tipe file
    if (!props.allowedTypes.includes(file.type)) {
      errors.value.push(`${file.name} memiliki format tidak valid. Hanya ${props.allowedTypes.join(', ')} yang diperbolehkan.`);
      continue;
    }

    // Validasi rasio gambar
    const isValidRatio = await checkImageAspectRatio(file, props.aspectRatio);
    if (!isValidRatio) {
      errors.value.push(`${file.name} harus memiliki rasio ${props.aspectRatio}.`);
      continue;
    }

    files.value.push(file);
  }

  isProcessing.value = false;
};

// Cek rasio gambar
const checkImageAspectRatio = (file: File, expectedRatio: string) => {
  return new Promise<boolean>((resolve) => {
    const [width, height] = expectedRatio.split(":").map(Number);
    const ratioNumber = width / height;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = img.width / img.height;
      resolve(Math.abs(ratio - ratioNumber) < 0.1);
    };
  });
};

// Hapus file dari daftar
const removeFile = (index: number) => {
  files.value.splice(index, 1);
};

// Pantau perubahan files dan kirim status error
watch(
  () => files.value.length,
  () => {
    emit('update:files', files.value);
    emit('update:hasError', hasError.value);
  }
);
</script>

<template>
  <div class="space-y-2">
    <label class="text-black-grey-700 text-semibold">Upload Gambar</label>

    <!-- Input File (Hidden) -->
    <input type="file" accept="image/jpeg, image/png, image/jpg, image/heic" multiple @change="handleFileChange" class="hidden" id="file-upload" />

    <!-- Drag & Drop Frame -->
    <label
      for="file-upload"
      class="mt-1 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black-grey-200 rounded-lg cursor-pointer hover:bg-white-400"
    >
      <p class="text-black-grey-600">Upload Gambar</p>
      <p class="small-text-normal text-black-grey-400">(Klik atau Seret Gambar ke Sini)</p>
    </label>

    <!-- Daftar File -->
    <div v-if="files.length" class="mt-2 space-y-2">
      <div v-for="(file, index) in files" :key="index" class="flex items-center justify-between p-2 border rounded">
        <div>
          <p class="small-text-normal">{{ file.name }} - {{ (file.size / 1024).toFixed(2) }} KB</p>
        </div>
        <button @click="removeFile(index)" class="text-red-175 small-text-normal">Hapus</button>
      </div>
    </div>

    <!-- Error Messages -->
    <p v-if="errors.length" class="text-red-175 small-text-normal mt-1" v-for="error in errors" :key="error">{{ error }}</p>
    <p v-if="hasError" class="text-red-175 small-text-normal mt-1">Minimal upload {{ minImages }} gambar.</p>
  </div>
</template>
