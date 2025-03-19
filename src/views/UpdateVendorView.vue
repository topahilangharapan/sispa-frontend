<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendor.ts'
import { useRoute } from 'vue-router'
import VNavbar from '../components/VNavbar.vue'
import { useAuthStore } from '../stores/auth.ts'
import VLoading from '../components/VLoading.vue'
import router from '../router'
import VTextArea from '../components/VTextArea.vue'
import VInputField from '../components/VInputField.vue'
import VButton from '../components/VButton.vue'

const title = ref({ 'Purchasing': '/purchasing' });
const submodules = ref({
  "Vendor": "/purchasing/vendor",
});

const vendorStore = useVendorStore()
const authStore = useAuthStore()
const route = useRoute()

const formData = ref({
  id: '',
  name: '',
  contact: '',
  email: '',
  address: '',
  service: '',
  description: '',
})

const isDataLoaded = ref(false)
onMounted(async () => {
  const vendorId = route.params.id as string
  await vendorStore.getVendorById(authStore.token, vendorId)
  console.log(vendorId)

  if (vendorStore.currentVendor) {
    formData.value = {
      id: vendorStore.currentVendor.id,
      name: vendorStore.currentVendor.name,
      contact: vendorStore.currentVendor.contact,
      email: vendorStore.currentVendor.email,
      address: vendorStore.currentVendor.address,
      service: vendorStore.currentVendor.service,
      description: vendorStore.currentVendor.description,
    }
    isDataLoaded.value = true
    console.log(formData.value);

  } else {
    console.log('Data vendor tidak ditemukan')
  }
})

const hasErrors = ref({
  contact: true,
  email: true,
  address: true,
  service: true,
  description: true,
})

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
  console.log(`Field ${field} error status:`, isError);
};

const isFormValid = computed(() => {
  const isValid = Object.values(hasErrors.value).every(error => !error);
  console.log('Form is valid:', isValid);
  return isValid;
});

const submitForm = async () => {
  console.log('Submitting form...');
  if (!isFormValid.value) {
    console.log('Form is not valid. Aborting submit.');
    return;
  }

  try {
    console.log('Form data to submit:', formData.value);
    const isSuccess = await vendorStore.updateVendor(formData.value);

    if (isSuccess) {
      console.log('Update successful. Redirecting...');
      router.push("/purchasing/vendor");
    } else {
      console.log('Update failed.');
    }
  } catch (error) {
    console.error('Error during submit:', error);
  } finally {
    authStore.loading = false;
  }
};
</script>

<template>
  <VNavbar :title="title" :submodules="submodules"></VNavbar>
  <main class="w-full h-screen flex justify-center items-center">
    <VLoading v-if="authStore.loading || vendorStore.loading" class="flex mr-64"/>

    <div v-else class="w-[100%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h2 class="mb-2 heading-2">Update Vendor</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col gap-2 py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex flex-col">
              <label class="mb-1 text-black-grey-700 text-semibold">Nama</label>
              <p class="px-3 py-2 border rounded-lg bg-gray-100">{{ formData.name }}</p>
            </div>
            <VInputField
              v-model="formData.contact"
              label="Kontak"
              placeholder="Masukkan kontak disini"
              :isNumberOnly="true"
              @update:hasError="updateErrorStatus('contact', $event)"
            />
          </div>
          <div>
            <VInputField
              v-model="formData.email"
              label="Email"
              placeholder="Enter text here"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('email', $event)"
            />
            <VInputField
              v-model="formData.service"
              label="Layanan"
              placeholder="Masukkan layanan disini"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('service', $event)"
            />
          </div>
        </div>

        <div>
          <VInputField
            v-model="formData.address"
            label="Alamat"
            placeholder="Masukkan alamat disini"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('address', $event)"
          />
          <VTextArea
            v-model="formData.description"
            label="Deskripsi"
            placeholder="Masukkan deskripsi disini"
            :isEmpty="true"
            @update:hasError="updateErrorStatus('description', $event)"
          />
        </div>

        <div class="flex justify-center gap-2 py-2">
          <VButton @click="router.back()" type="button" variant="delete" class="bg-slate-600 hover:bg-slate-800 text-white">
            Kembali
          </VButton>
          <VButton variant="primary" @click="submitForm" :disabled="!isFormValid">
            Update
          </VButton>
        </div>
      </form>
    </div>
  </main>
</template>
