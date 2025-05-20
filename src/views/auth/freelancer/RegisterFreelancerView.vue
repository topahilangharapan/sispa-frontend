<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth.ts'
import type {
  CreateFreelancerRequestInterface,
  CreateWorkExperienceRequestInterface,
} from '../../../interfaces/freelancer.interface.ts'
import VButton from '../../../components/VButton.vue'
import VInputField from '../../../components/VInputField.vue'
import VDropdown from '../../../components/VDropdown.vue'
import VLoading from '../../../components/VLoading.vue'
import VInputDateField from '../../../components/VInputDateField.vue'
import { useFreelancerStore } from '../../../stores/freelancer.ts'
import VTextArea from '../../../components/VTextArea.vue'

const router = useRouter()
const authStore = useAuthStore()
const freelancerStore = useFreelancerStore()

// Form progress tracking
const currentStep = ref(1)
const totalSteps = 3
const steps = [
  {
    number: 1,
    title: 'Informasi Akun',
    description: 'Buat data kredensial akun Anda',
  },
  {
    number: 2,
    title: 'Detail Pribadi',
    description: 'Ceritakan lebih banyak tentang diri Anda',
  },
  {
    number: 3,
    title: 'Pengalaman Kerja',
    description: 'Bagikan latar belakang profesional Anda',
  },
]

onMounted(async () => {
  const savedAuth = localStorage.getItem('auth')

  if (savedAuth) {
    authStore.$patch(JSON.parse(savedAuth))
  }

  await freelancerStore.getWorkExperienceCategories()
  workExperienceCategoryOption.value =
    freelancerStore?.workExperienceCategories?.map(workExperienceCategory => ({
      value: workExperienceCategory.name,
      label: workExperienceCategory.name,
    })) || []

  await freelancerStore.getEducationLevels()
  educationLevelOption.value =
    freelancerStore?.educationLevels?.map(educationLevel => ({
      value: educationLevel.name,
      label: educationLevel.name,
    })) || []
})

const workExperiences = ref<CreateWorkExperienceRequestInterface[]>([])
let experienceCounter = 0

const today = new Date().toISOString().split('T')[0]
const todayDate = new Date()
const minBirthDate = new Date(
  todayDate.getFullYear() - 17,
  todayDate.getMonth(),
  todayDate.getDate(),
)
  .toISOString()
  .split('T')[0]

const formData = ref<CreateFreelancerRequestInterface>({
  email: '',
  username: '',
  name: '',
  password: '',
  role: 'FREELANCER',
  address: '',
  phoneNumber: '',
  placeOfBirth: '',
  dateOfBirth: minBirthDate,
  education: '',
  nik: '',
  reason: '',
  workExperiences: workExperiences.value,
})

interface HasErrors {
  username: boolean
  email: boolean
  name: boolean
  password: boolean
  role: boolean
  address: boolean
  phoneNumber: boolean
  placeOfBirth: boolean
  dateOfBirth: boolean
  education: boolean
  nik: boolean
  reason: boolean
  [key: string]: boolean // Allows any additional string keys
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
  reason: true,
})

const roleOption = ref<{ value: string; label: string }[]>([
  { value: 'FREELANCER', label: 'Freelancer' },
])

const workExperienceCategoryOption = ref<{ value: string; label: string }[]>([])

const educationLevelOption = ref<{ value: string; label: string }[]>([])

const updateErrorStatus = (field: string, isError: boolean) => {
  hasErrors.value[field] = isError
}

const isFormValid = computed(() =>
  Object.values(hasErrors.value).every(error => !error),
)

// Check if current step is valid
const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return (
      !hasErrors.value.username &&
      !hasErrors.value.email &&
      !hasErrors.value.password
    )
  } else if (currentStep.value === 2) {
    return (
      !hasErrors.value.name &&
      !hasErrors.value.address &&
      !hasErrors.value.phoneNumber &&
      !hasErrors.value.placeOfBirth &&
      !hasErrors.value.dateOfBirth &&
      !hasErrors.value.education &&
      !hasErrors.value.nik &&
      !hasErrors.value.reason
    )
  }
  // For step 3 (work experience), at least validate that required fields in each work experience are filled
  return true
})

const addWorkExperience = () => {
  const tempId = `exp-${experienceCounter++}`

  const newExperience: CreateWorkExperienceRequestInterface = {
    tempId,
    category: '',
    title: '',
    description: '',
    isStillWorking: false,
    startDate: today,
    endDate: today,
  }

  workExperiences.value.push(newExperience)

  // Add hasErrors for each WorkExperience field
  hasErrors.value[`category-${tempId}`] = true
  hasErrors.value[`title-${tempId}`] = true
  hasErrors.value[`description-${tempId}`] = true
  hasErrors.value[`startDate-${tempId}`] = false
  hasErrors.value[`endDate-${tempId}`] = false
}

const removeWorkExperience = (tempId: string) => {
  const index = workExperiences.value.findIndex(exp => exp.tempId === tempId)
  if (index === -1) return

  workExperiences.value.splice(index, 1)

  // Remove field errors
  delete hasErrors.value[`category-${tempId}`]
  delete hasErrors.value[`title-${tempId}`]
  delete hasErrors.value[`description-${tempId}`]
  delete hasErrors.value[`startDate-${tempId}`]
  delete hasErrors.value[`endDate-${tempId}`]
}

watch(
  workExperiences,
  experiences => {
    experiences.forEach(exp => {
      watch(
        () => exp.isStillWorking,
        val => {
          if (val) {
            exp.endDate = ''
            updateErrorStatus(`endDate-${exp.tempId}`, false)
          } else {
            exp.endDate = today
          }
        },
        { immediate: true },
      )
    })
  },
  { deep: true },
)

// Navigation functions
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Initialize with at least one work experience
if (workExperiences.value.length === 0) {
  addWorkExperience()
}

const submitForm = async () => {
  if (!isFormValid.value) return

  const payload = {
    ...formData.value,
    workExperiences: workExperiences.value,
  }

  const isSuccess = await freelancerStore.add(payload)

  const title = 'Pendaftaran Berhasil!'
  const information =
    'Terima kasih telah mendaftar bersama kami.;Tim kami akan segera menghubungi Anda dengan informasi lebih lanjut.;Jika ada pertanyaan, silakan email ke adrasa.cantya@ui.ac.id.'
  const url = '/auth/login'

  const urlVar = `?title=${title}&information=${information}&url=${url}`

  if (isSuccess) {
    await router.push(`/component/message${urlVar}`)
  }
}
</script>

<template>
  <div
    class="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
    style="background-image: url('/background-auth.jpg')"
  >
    <VLoading v-if="authStore.loading" class="flex" />

    <div
      v-else
      class="w-full max-w-4xl bg-white/95 rounded-3xl shadow-xl p-8 backdrop-blur-md my-12"
    >
      <!-- Header dengan indikator progres -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-center text-red-400 mb-2">
          Pendaftaran Freelancer
        </h2>
        <p class="text-center text-brown-400 mb-6">
          Bergabunglah dengan jaringan freelancer profesional kami
        </p>

        <!-- Bar progres -->
        <div class="relative flex items-center justify-between px-6">
          <!-- Garis latar belakang -->
          <div class="absolute top-[15px] left-0 right-0 h-1 bg-gray-300 z-0">
            <div
              class="h-1 bg-green-800 transition-all duration-300"
              :style="{
                width: ((currentStep - 1) / (steps.length - 1)) * 100 + '%',
              }"
            ></div>
          </div>

          <!-- Item langkah -->
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex flex-col items-center z-10 relative"
          >
            <!-- Lingkaran langkah -->
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full"
              :class="[
                currentStep > step.number
                  ? 'bg-green-800 text-white'
                  : currentStep === step.number
                    ? 'bg-blue-800 text-white'
                    : 'bg-gray-200 text-gray-500',
              ]"
            >
              <span
                v-if="currentStep > step.number"
                class="fas fa-check text-sm"
              ></span>
              <span v-else>{{ step.number }}</span>
            </div>

            <!-- Judul langkah -->
            <p
              class="text-sm font-medium mt-2 text-center"
              :class="{
              'text-blue-800 text-green-800': currentStep > step.number,
              'text-blue-800 text-blue-800': currentStep === step.number,
              'text-gray-200 text-gray-500': currentStep < step.number
            }"
            >
              {{ step.title }}
            </p>

            <!-- Deskripsi langkah -->
            <p class="text-xs text-gray-500 text-center mt-1 h-4">
              {{ currentStep === step.number ? step.description : '' }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Langkah 1: Informasi Akun -->
        <div v-if="currentStep === 1" class="space-y-6 fade-in">
          <h3
            class="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-400/70 pb-2"
          >
            Informasi Akun
          </h3>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputField
              v-model="formData.username"
              label="Username"
              placeholder="Masukkan Username Anda"
              :isEmpty="true"
              @update:hasError="updateErrorStatus('username', $event)"
            />
            <VInputField
              v-model="formData.email"
              label="Email"
              placeholder="Masukkan email Anda"
              :isEmpty="true"
              :isEmail="true"
              @update:hasError="updateErrorStatus('email', $event)"
            />
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputField
              v-model="formData.password"
              label="Kata Sandi"
              type="password"
              placeholder="Masukkan kata sandi Anda"
              :isEmpty="true"
              :minLength="6"
              @update:hasError="updateErrorStatus('password', $event)"
            />
            <VDropdown
              v-model="formData.role"
              label="Role"
              :options="roleOption"
              placeholder="Pilih Role"
              :isEmpty="true"
              :disabled="true"
              @update:hasError="updateErrorStatus('role', $event)"
            />
          </div>
        </div>

        <!-- Step 2: Personal Details -->
        <div v-if="currentStep === 2" class="space-y-6 fade-in">
          <h3
            class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-400/70"
          >
            Detail Pribadi
          </h3>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputField
              v-model="formData.name"
              label="Nama Lengkap"
              :isEmpty="true"
              placeholder="Masukkan nama lengkap Anda"
              @update:hasError="updateErrorStatus('name', $event)"
            />
            <VInputField
              v-model="formData.address"
              label="Alamat"
              :isEmpty="true"
              placeholder="Masukkan alamat Anda"
              @update:hasError="updateErrorStatus('address', $event)"
            />
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputField
              v-model="formData.phoneNumber"
              label="Nomor Telepon"
              :isEmpty="true"
              :isNumberOnly="true"
              placeholder="Masukkan nomor telepon Anda"
              @update:hasError="updateErrorStatus('phoneNumber', $event)"
            />
            <VInputField
              v-model="formData.placeOfBirth"
              label="Tempat Lahir"
              :isEmpty="true"
              placeholder="Masukkan tempat lahir Anda"
              @update:hasError="updateErrorStatus('placeOfBirth', $event)"
            />
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputDateField
              v-model="formData.dateOfBirth"
              :maxDate="minBirthDate"
              label="Tanggal Lahir"
              @update:hasError="updateErrorStatus('dateOfBirth', $event)"
            />
            <VDropdown
              v-model="formData.education"
              :isEmpty="true"
              :options="educationLevelOption"
              label="Tingkat Pendidikan"
              placeholder="Pilih tingkat pendidikan Anda"
              @update:hasError="updateErrorStatus('education', $event)"
            />
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <VInputField
              v-model="formData.nik"
              :minLength="16"
              :maxLength="16"
              :isEmpty="true"
              :isNumberOnly="true"
              label="NIK (Nomor Induk Kependudukan)"
              placeholder="Masukkan NIK Anda"
              @update:hasError="updateErrorStatus('nik', $event)"
            />
          </div>

        <VTextArea
          v-model="formData.reason"
          :isEmpty="true"
          label="Alasan Bergabung"
          placeholder="Kenapa Anda ingin bergabung?"
          @update:hasError="updateErrorStatus('reason', $event)"
        />
        </div>


        <!-- Step 3: Work Experience -->
        <!-- Langkah 3: Pengalaman Kerja -->
        <div v-if="currentStep === 3" class="space-y-6 fade-in">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-800">
              Pengalaman Kerja
            </h3>
            <VButton
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              @click="addWorkExperience"
            >
              <span class="mr-2">Tambah Pengalaman</span>
              <span class="text-lg">+</span>
            </VButton>
          </div>

          <div
            v-if="workExperiences.length === 0"
            class="bg-brown-100/10 border border-brown-200 rounded-xl p-6 text-center"
          >
            <p class="text-brown-400">
              Belum ada pengalaman kerja yang ditambahkan. Klik tombol di atas
              untuk menambahkan pengalaman pertama Anda.
            </p>
          </div>

          <div
            v-for="(exp, index) in workExperiences"
            :key="index"
            class="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium text-gray-800">
                Pengalaman {{ index + 1 }}
              </h4>
              <VButton
                class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-lg text-sm"
                @click="removeWorkExperience(exp.tempId)"
              >
                Hapus
              </VButton>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <VDropdown
                v-model="exp.category"
                :isEmpty="true"
                label="Kategori"
                :options="workExperienceCategoryOption"
                placeholder="Pilih kategori"
                @update:hasError="
                  updateErrorStatus(`category-${exp.tempId}`, $event)
                "
              />
              <VInputField
                v-model="exp.title"
                :isEmpty="true"
                label="Jabatan"
                placeholder="Masukkan jabatan pekerjaan Anda"
                @update:hasError="
                  updateErrorStatus(`title-${exp.tempId}`, $event)
                "
              />
            </div>

            <VTextArea
              v-model="exp.description"
              :isEmpty="true"
              label="Deskripsi"
              placeholder="Jelaskan tanggung jawab dan pencapaian Anda"
              @update:hasError="
                updateErrorStatus(`description-${exp.tempId}`, $event)
              "
            />

            <div class="grid md:grid-cols-2 gap-4">
              <VInputDateField
                v-model="exp.startDate"
                :minDate="formData.dateOfBirth"
                label="Tanggal Mulai"
                @update:hasError="
                  updateErrorStatus(`startDate-${exp.tempId}`, $event)
                "
              />
              <div>
                <VInputDateField
                  v-model="exp.endDate"
                  :min-date="exp.startDate"
                  label="Tanggal Selesai"
                  :disabled="exp.isStillWorking"
                  @update:hasError="
                    updateErrorStatus(`endDate-${exp.tempId}`, $event)
                  "
                />
                <div class="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    v-model="exp.isStillWorking"
                    class="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label class="text-gray-700 text-sm"
                    >Masih Bekerja di Sini</label
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation and Submit Buttons with "Kembali ke Login" on the left -->
        <div class="pt-6 flex justify-between items-center">

          <span @click="router.push('/auth/login')" class="text-red-400 hover:text-red-200 cursor-pointer font-medium text-sm">
                Kembali ke Login
          </span>

          <!-- Tombol navigasi di kanan -->
          <div class="flex space-x-4">
            <VButton
              v-if="currentStep > 1"
              @click="prevStep"
              class="px-6 py-2"
              size="md"
            >
              Back
            </VButton>

            <VButton
              v-if="currentStep < totalSteps"
              variant="primary"
              @click="nextStep"
              :disabled="!isCurrentStepValid"
              class="px-6 py-2"
              size="md"
            >
              Continue
            </VButton>

            <VButton
              v-else
              variant="primary"
              @click="submitForm"
              :disabled="!isFormValid"
              class="px-8 py-2"
              size="md"
            >
              Submit Registration
            </VButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
