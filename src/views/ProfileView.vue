<template>
  <div class="profile-container">
    <VNavbar title="User Profile" />
    <div class="profile-card">
      <h2>General</h2>

      <div class="profile-field">
        <label>Name</label>
        <p v-if="!isEditing">{{ userStore.profile.name }}</p>
        <VInputField v-else v-model="userStore.profile.name" />
      </div>

      <div class="profile-field">
        <label>Email address</label>
        <p v-if="!isEditing">{{ userStore.profile.email }}</p>
        <VInputField v-else v-model="userStore.profile.email" />
      </div>

      <div class="profile-field">
        <label>Address</label>
        <p v-if="!isEditing">{{ userStore.profile.address }}</p>
        <VInputField v-else v-model="userStore.profile.address" />
      </div>

      <div class="profile-field">
        <label>Phone Number</label>
        <p v-if="!isEditing">{{ userStore.profile.phoneNumber }}</p>
        <VInputField v-else v-model="userStore.profile.phoneNumber" />
      </div>

      <div class="profile-field">
        <label>Place of Birth</label>
        <p v-if="!isEditing">{{ userStore.profile.placeOfBirth }}</p>
        <VInputField v-else v-model="userStore.profile.placeOfBirth" />
      </div>

      <div class="profile-field">
        <label>Date of Birth</label>
        <p v-if="!isEditing">{{ userStore.profile.dateOfBirth }}</p>
        <VInputField v-else v-model="userStore.profile.dateOfBirth" type="date" />
      </div>

      <div class="profile-field">
        <label>Role</label>
        <p v-if="!isEditing">{{ userStore.profile.role }}</p>
        <VInputField v-else v-model="userStore.profile.role" />
      </div>

      <div class="actions">
        <VButton
          v-if="!isEditing"
          @click="startEditing"
        >
          Edit Profile
        </VButton>

        <VButton
          v-if="isEditing"
          @click="saveProfile"
        >
          Save
        </VButton>

        <VButton
          v-if="isEditing"
          @click="cancelEditing"
        >
          Cancel
        </VButton>
      </div>

      <p v-if="userStore.loading">Loading...</p>
      <p v-if="userStore.error" style="color:red;">{{ userStore.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user.ts' // adjust path
import VNavbar from '../components/VNavbar.vue'
import VButton from '../components/VButton.vue'
import VInputField from '../components/VInputField.vue'

const userStore = useUserStore()
const isEditing = ref(false)
const originalProfile = ref({})

onMounted(async () => {
  // example: user #1
  await userStore.fetchUser(1)
  originalProfile.value = { ...userStore.profile }
})

function startEditing() {
  isEditing.value = true
}

async function saveProfile() {
  const success = await userStore.updateUserProfile()
  if (success) {
    isEditing.value = false
    originalProfile.value = { ...userStore.profile }
  }
}

function cancelEditing() {
  userStore.profile = { ...originalProfile.value }
  isEditing.value = false
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 1200px;
}

.profile-card {
  background: white;
  width: 70%;
  max-width: 900px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.profile-field {
  margin-bottom: 20px;
}

.profile-field label {
  font-weight: bold;
  display: block;
}

.profile-field p {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}
</style>
