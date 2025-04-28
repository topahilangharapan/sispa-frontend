<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/auth.ts'
import type {
  CreateFreelancerRequestInterface,
  CreateWorkExperienceRequestInterface
} from '../../../interfaces/freelancer.interface.ts'
import VButton from '../../../components/VButton.vue'
import VInputField from '../../../components/VInputField.vue'
import VDropdown from '../../../components/VDropdown.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputDateField from '../../../components/VInputDateField.vue'
import { useFreelancerStore } from '../../../stores/freelancer.ts'
import VTextArea from '../../../components/VTextArea.vue'

const router = useRouter();
const authStore = useAuthStore();
const freelancerStore = useFreelancerStore();

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  await freelancerStore.getWorkExperienceCategories();
  workExperienceCategoryOption.value = freelancerStore?.workExperienceCategories?.map((workExperienceCategory) => ({
    value: workExperienceCategory.name,
    label: workExperienceCategory.name,
  })) || [];

  await freelancerStore.getEducationLevels();
  educationLevelOption.value = freelancerStore?.educationLevels?.map((educationLevel) => ({
    value: educationLevel.name,
    label: educationLevel.name,
  })) || [];
});

const workExperiences = ref<CreateWorkExperienceRequestInterface[]>([]);
let experienceCounter = 0;

const today = new Date().toISOString().split('T')[0];

const formData = ref<CreateFreelancerRequestInterface>({
  email: '',
  username: '',
  name: '',
  password: '',
  role: 'FREELANCER',
  address: '',
  phoneNumber: '',
  placeOfBirth: '',
  dateOfBirth: today,
  education: '',
  nik: '',
  reason: '',
  workExperiences: workExperiences.value,
});

interface HasErrors {
  username: boolean;
  email: boolean;
  name: boolean;
  password: boolean;
  role: boolean;
  address: boolean;
  phoneNumber: boolean;
  placeOfBirth: boolean;
  dateOfBirth: boolean;
  education: boolean;
  nik: boolean;
  reason: boolean;
  [key: string]: boolean; // Allows any additional string keys
}

const hasErrors = ref<HasErrors>({
  username: true,
  email: true,
  name: true,
  password: true,
  role: false,
  address: true,
  phoneNumber: true,
  placeOfBirth: true,
  dateOfBirth: false,
  education: true,
  nik: true,
  reason: true
});

const roleOption = ref<{ value: string; label: string }[]>([
  { value: "FREELANCER", label: "FREELANCER" }
]);


const workExperienceCategoryOption = ref<{ value: string; label: string }[]>([]);

const educationLevelOption = ref<{ value: string; label: string }[]>([]);

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError;
};

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error)
);

const addWorkExperience = () => {
  const tempId = `exp-${experienceCounter++}`;

  const newExperience: CreateWorkExperienceRequestInterface = {
    tempId,
    category: "",
    title: "",
    description: "",
    isStillWorking: false,
    startDate: today,
    endDate: today,
  };

  workExperiences.value.push(newExperience);

  // Tambahkan hasErrors untuk setiap field WorkExperience
  hasErrors.value[`category-${tempId}`] = true;
  hasErrors.value[`title-${tempId}`] = true;
  hasErrors.value[`description-${tempId}`] = true;
  hasErrors.value[`startDate-${tempId}`] = false;
  hasErrors.value[`endDate-${tempId}`] = false;
};

const removeWorkExperience = (tempId: string) => {
  const index = workExperiences.value.findIndex(exp => exp.tempId === tempId);
  if (index === -1) return;

  workExperiences.value.splice(index, 1);

  // Hapus hasErrors per field
  delete hasErrors.value[`category-${tempId}`];
  delete hasErrors.value[`title-${tempId}`];
  delete hasErrors.value[`description-${tempId}`];
  delete hasErrors.value[`startDate-${tempId}`];
  delete hasErrors.value[`endDate-${tempId}`];
};

watch(workExperiences, (experiences) => {
  experiences.forEach((exp) => {
    watch(() => exp.isStillWorking, (val) => {
      if (val) {
        exp.endDate = "";
        updateErrorStatus(`endDate-${exp.tempId}`, false);
      } else {
        exp.endDate = today;
      }
    }, { immediate: true });
  });
}, { deep: true });

const submitForm = async () => {
  if (!isFormValid.value) return;

  const payload = {
    ...formData.value,
    workExperiences: workExperiences.value, // ambil value-nya, bukan ref-nya
  };

  // kirim payload ke API atau lanjut proses
  console.log(payload);

  const isSuccess = await freelancerStore.add(payload);

  if (isSuccess) {
    await router.push('/auth/register/freelancer/success')
  }
};
</script>

<template>
  <div class="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
       style="background-image: url('/background-auth.jpg'); background-attachment: fixed;">

    <VLoading v-if="authStore.loading" class="flex" />

    <div v-else class="w-[64rem] max-w-7xl bg-white/80 rounded-2xl shadow-2xl pl-12 pr-12 pt-8 pb-8 backdrop-blur-md mt-16 mb-16">
      <h2 class="text-3xl font-bold text-center text-red-400 mb-10">Form Registrasi Freelancer</h2>

      <form @submit.prevent="submitForm" class="space-y-6">

        <!-- Informasi Akun -->
        <h3 class="large-text-bold text-black-grey-800 mb-4">Informasi Akun</h3>
        <div class="grid grid-cols-3 gap-6">
          <VInputField v-model="formData.username" label="Username" placeholder="Masukkan username" :isEmpty="true" @update:hasError="updateErrorStatus('username', $event)" />
          <VInputField v-model="formData.email" label="Email" placeholder="Masukkan email" :isEmpty="true" :isEmail="true" @update:hasError="updateErrorStatus('email', $event)" />
          <VInputField v-model="formData.password" label="Password" type="password" placeholder="Masukkan password" :isEmpty="true" :minLength="6" @update:hasError="updateErrorStatus('password', $event)" />
        </div>

        <div class="grid grid-cols-3 gap-6">
          <VDropdown v-model="formData.role" label="Role" :options="roleOption" placeholder="Pilih Role" :isEmpty="true" :disabled="true" @update:hasError="updateErrorStatus('role', $event)" />
          <VInputField v-model="formData.name" label="Nama Lengkap" :isEmpty="true" placeholder="Masukkan nama lengkap" @update:hasError="updateErrorStatus('name', $event)" />
          <VInputField v-model="formData.address" label="Alamat" :isEmpty="true" placeholder="Masukkan alamat" @update:hasError="updateErrorStatus('address', $event)"/>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <VInputField v-model="formData.phoneNumber" label="Nomor Telepon" :isEmpty="true" :isNumberOnly="true" placeholder="Masukkan nomor telepon" @update:hasError="updateErrorStatus('phoneNumber', $event)"  />
          <VInputField v-model="formData.placeOfBirth" label="Tempat Lahir" :isEmpty="true"  placeholder="Masukkan tempat lahir" @update:hasError="updateErrorStatus('placeOfBirth', $event)"  />
          <VInputDateField v-model="formData.dateOfBirth" label="Tanggal Lahir" @update:hasError="updateErrorStatus('dateOfBirth', $event)"  />
        </div>

        <div class="grid grid-cols-3 gap-6">
          <VDropdown v-model="formData.education" :isEmpty="true" :options="educationLevelOption" label="Pendidikan Terakhir" placeholder="Pilih pendidikan terakhir" @update:hasError="updateErrorStatus('education', $event)"  />
          <VInputField v-model="formData.nik" :minLength="16" :maxLength="16" :isEmpty="true" :isNumberOnly="true" label="NIK" placeholder="Masukkan NIK" @update:hasError="updateErrorStatus('nik', $event)" />
          <VInputField v-model="formData.reason" :isEmpty="true" label="Alasan Bergabung" placeholder="Kenapa ingin bergabung?" @update:hasError="updateErrorStatus('reason', $event)" />
        </div>

        <!-- Pengalaman Kerja -->
        <div>
          <h3 class="large-text-bold text-black-grey-800 mb-4">Pengalaman Kerja</h3>
          <div v-for="(exp, index) in formData.workExperiences" :key="index" class="bg-white border border-gray-300 rounded-xl p-6 mb-6 space-y-4">
            <div class="grid grid-cols-3 gap-6">
              <VDropdown v-model="exp.category" :isEmpty="true" label="Kategori" :options="workExperienceCategoryOption" placeholder="Pilih kategori" @update:hasError="updateErrorStatus(`category-${exp.tempId}`, $event)" />
              <VInputField v-model="exp.title" :isEmpty="true" label="Judul" placeholder="Masukkan judul pengalaman" @update:hasError="updateErrorStatus(`title-${exp.tempId}`, $event)"/>
              <VTextArea v-model="exp.description" :isEmpty="true" label="Deskripsi" placeholder="Deskripsi pengalaman" @update:hasError="updateErrorStatus(`description-${exp.tempId}`, $event)"/>
            </div>
            <div class="grid grid-cols-3 gap-6">
              <VInputDateField v-model="exp.startDate" :minDate="formData.dateOfBirth" label="Tanggal Mulai" @update:hasError="updateErrorStatus(`startDate-${exp.tempId}`, $event)" />
              <div>
                <VInputDateField
                  v-model="exp.endDate"
                  :min-date="exp.startDate"
                  label="Tanggal Selesai"
                  :disabled="exp.isStillWorking"
                  @update:hasError="updateErrorStatus(`endDate-${exp.tempId}`, $event)"
                />
                <div class="flex items-center gap-2 mt-2">
                  <input type="checkbox" v-model="exp.isStillWorking" class="form-checkbox" />
                  <label class="text-gray-700 small-text-normal">Masih Bekerja</label>
                </div>
              </div>

            </div>
            <div class="text-right">
              <VButton class="bg-red-300 hover:bg-red-200 text-white px-4 py-2 rounded" @click="removeWorkExperience(exp.tempId)">Hapus</VButton>
            </div>
          </div>
          <VButton class="bg-green-800 hover:bg-green-700 px-5 py-2 rounded text-white" @click="addWorkExperience">Tambah Pengalaman</VButton>
        </div>

        <!-- Tombol Submit -->
        <div class="pt-6">
          <VButton variant="primary" @click="submitForm" :disabled="!isFormValid" class="w-full" size="md">
            Daftar
          </VButton>
        </div>
      </form>

      <p class="text-normal text-center mt-4">Sudah punya akun?
        <span @click="router.push('/auth/login')" class="text-blue-500 cursor-pointer text-normal">Login di sini</span>
      </p>

    </div>
  </div>
</template>


