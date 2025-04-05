<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useClientStore } from '../../../stores/client.ts'
import { useAuthStore } from '../../../stores/auth.ts'
import { useRoute } from 'vue-router'
import router from '../../../router'
import VInputField from '../../../components/VInputField.vue'
import VTextArea from '../../../components/VTextArea.vue'
import VButton from '../../../components/VButton.vue'
import VLoading from '../../../components/VLoading.vue'
import VNavbar from '../../../components/VNavbar.vue'

const title = ref({ 'Marketing': '/marketing' });
const submodules = ref({
  "Purchase Order": "/marketing/purchase-order",
  "Klien": "/marketing/client",
});

const clientStore = useClientStore()
const authStore = useAuthStore()
const route = useRoute()

const clientId = ref('')
const formData = ref({
  name: '',
  contact: '',
  email: '',
  address: '',
  industry: '',
  description: '',
})

const originalContact = ref('')
const phoneChanged = ref(false)
const phoneExistsError = ref(false)
const emailError = ref(false);



// Update the watch for email validation with proper type handling
watch(() => formData.value.email, (newVal) => {
  // Ensure we're assigning a boolean value
  if (typeof newVal === 'string' && newVal.trim() !== '') {
    emailError.value = !newVal.includes('@');
  } else {
    emailError.value = false; // No error if there's no email (will be caught by isEmpty validation)
  }
});

const isDataLoaded = ref(false)
onMounted(async () => {
  clientId.value = route.params.id as string
  if (!authStore.token) {
    console.error('Token tidak tersedia');
    return;
  }
  await clientStore.getClients(authStore.token)
  await clientStore.getClientById(authStore.token, clientId.value)
  console.log(clientId.value)

  if (clientStore.currentClient) {
    formData.value = {
      name: clientStore.currentClient.name,
      contact: clientStore.currentClient.contact,
      email: clientStore.currentClient.email,
      address: clientStore.currentClient.address,
      industry: clientStore.currentClient.industry,
      description: clientStore.currentClient.description,
    }
    originalContact.value = clientStore.currentClient.contact
    isDataLoaded.value = true
    console.log(formData.value);

  } else {
    console.log('Data client tidak ditemukan')
  }
})

watch(() => formData.value.contact, async (newVal) => {
  if (isDataLoaded.value && newVal !== originalContact.value) {
    phoneChanged.value = true
    
    if (newVal.trim() !== '') {
      phoneExistsError.value = await clientStore.checkPhoneExists(newVal, clientId.value)
    } else {
      phoneExistsError.value = false
    }
  } else {
    phoneChanged.value = false
    phoneExistsError.value = false
  }
})



const hasErrors = ref<{ [key: string]: boolean }>({
  contact: true,
  email: true,
  address: true,
  industry: true,
  description: true,
});

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
  console.log(`Field ${field} error status:`, isError);
};

const isFormValid = computed(() => {
  const baseValid = Object.values(hasErrors.value).every(error => !error);
  return baseValid && !phoneExistsError.value && !emailError.value;
});

const submitForm = async () => {
  console.log('Submitting form...');
  if (!isFormValid.value) {
    console.log('Form is not valid. Aborting submit.');
    
    if (phoneExistsError.value) {
      window.$toast('error', 'Nomor telepon sudah digunakan oleh klien lain.')
    }

    if (emailError.value) {
      window.$toast('error', 'Email harus mengandung karakter @!');
    }
    
    return;
  }

  try {
    console.log('Form data to submit:', formData.value);
    const isSuccess = await clientStore.updateClient(formData.value, clientId.value);

    if (isSuccess) {
      console.log('Update successful. Redirecting...');
      router.push(`/marketing/client/${clientId.value}`);
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
    <VLoading v-if="authStore.loading || clientStore.loading" class="flex mr-64"/>

    <div v-else class="w-[100%] flex flex-col gap-2 divide-y-2 bg-white drop-shadow-xl p-6 rounded-xl">
      <div class="w-full flex justify-between">
        <h2 class="mb-2 heading-2">Update Klien</h2>
        <hr class="border-gray-300 border-t-2 mb-4" />
      </div>

      <form @submit.prevent="submitForm" class="flex flex-col gap-2 py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex flex-col">
              <label class="mb-1 text-black-grey-700 text-semibold">Nama</label>
              <p class="px-3 py-2 border rounded-lg bg-gray-100">{{ formData.name }}</p>
            </div>
            <div class="flex flex-col">
              <VInputField
                v-model="formData.contact"
                label="Kontak"
                placeholder="Masukkan kontak disini"
                :isNumberOnly="true"
                :isEmpty="true"
                @update:hasError="updateErrorStatus('contact', $event)"
              />
              <p v-if="phoneExistsError" class="text-red-500 text-sm mt-1">
                Nomor telepon sudah digunakan oleh klien lain.
              </p>
            </div>
          </div>
          <div>
            <VInputField
              v-model="formData.email"
              label="Email"
              placeholder="Enter text here"
              :isEmpty="true"
              :isEmail="true"
              @update:hasError="updateErrorStatus('email', $event)"
            />
            <VInputField
              v-model="formData.industry"
              label="Industri"
              placeholder="Masukkan industri disini"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('industry', $event)"
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