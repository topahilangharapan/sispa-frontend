<script setup lang="ts">
import { computed, ref } from 'vue'
import VInputField from '../../components/VInputField.vue'
import VButton from '../../components/VButton.vue'

const formData = ref({
  name: '',
  age: '',
  email: ''
});

const hasErrors = ref({
  name: true,
  age: true,
  email: true
});

// Fungsi untuk update status error tiap input
const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

// Tombol bisa ditekan jika semua input tidak error
const isFormValid = computed(() => {
  return Object.values(hasErrors.value).every(error => error === false);
});

const submitForm = () => {
  if (isFormValid.value) {
    alert('Form berhasil dikirim!');
  }
};
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <VInputField
      v-model="formData.name"
      label="Nama"
      placeholder="Masukkan nama"
      :isEmpty="true"
      @update:hasError="updateErrorStatus('name', $event)"
    />

    <VInputField
      v-model="formData.age"
      label="Usia"
      placeholder="Masukkan usia"
      :isNumberOnly="true"
      :isEmpty="true"
      :isNegative="false"
      @update:hasError="updateErrorStatus('age', $event)"
    />

    <VInputField
      v-model="formData.email"
      label="Email"
      placeholder="Masukkan email"
      :isEmpty="true"
      :minLength="5"
      @update:hasError="updateErrorStatus('email', $event)"
    />


    <VButton variant="primary" @click="submitForm" :disabled="!isFormValid">Submit</VButton>
    <VButton variant="delete" size="lg">Disabled</VButton>
    <VButton variant="disabled" size="sm">Loading</VButton>

  </form>
</template>
