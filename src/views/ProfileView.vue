<template>
  <div class="profile-container">
    <VNavbar/>
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
        <p>{{ userStore.profile.role }}</p>
      </div>

      <div class="actions">
        <VButton
          v-if="!isEditing && !isChangingPasswordMode"
          @click="startEditing"
        >
          Edit Profile
        </VButton>

        <VButton
          v-if="!isEditing && !isChangingPasswordMode"
          @click="startPasswordChange"
        >
          Change Password
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

      <!-- Password Change Section - conditionally shown -->
      <div v-if="isChangingPasswordMode" class="password-section">
        <h3>Change Password</h3>
        <div class="profile-field">
          <label>New Password</label>
          <VInputField v-model="passwordData.newPassword" type="password" />
        </div>

        <div class="profile-field">
          <label>Confirm Password</label>
          <VInputField v-model="passwordData.confirmPassword" type="password" />
          <p v-if="passwordMismatch" class="error-text">Passwords do not match</p>
        </div>

        <div class="actions">
          <VButton @click="confirmPasswordChange" :disabled="isChangingPassword">
            Change Password
          </VButton>
          <VButton @click="cancelPasswordChange">
            Cancel
          </VButton>
        </div>
      </div>
    </div>

    <!-- Password Change Confirmation Modal -->
    <div v-if="showPasswordModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Password Change</h3>
        <p>Are you sure you want to change your password?</p>
        <div class="modal-actions">
          <VButton @click="changePassword" :disabled="userStore.loading">
            Yes, Change Password
          </VButton>
          <VButton @click="showPasswordModal = false" variant="primary">
            Cancel
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user.ts'
import { useAuthStore } from '../stores/auth'
import VNavbar from '../components/VNavbar.vue'
import VButton from '../components/VButton.vue'
import VInputField from '../components/VInputField.vue'
import type { UserProfileInterface } from '../interfaces/user.interface'

const userStore = useUserStore()
const authStore = useAuthStore()
const isEditing = ref(false)
const originalProfile = ref<{
  id?: number;
  name: string;
  email: string;
  address?: string;
  phoneNumber?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
  role?: string;
}>({
  name: '',
  email: ''
})


// Password change state
const passwordData = ref({
  newPassword: '',
  confirmPassword: ''
})
const showPasswordModal = ref(false)
const isChangingPassword = ref(false)
const isChangingPasswordMode = ref(false)

const passwordMismatch = computed(() => {
  return passwordData.value.newPassword !== passwordData.value.confirmPassword &&
         passwordData.value.confirmPassword.length > 0
})

onMounted(async () => {
  // example: user #1
  if (authStore.user?.username) {
    await userStore.fetchUser(undefined, authStore.user.username)
    // Fix for typeerror - initialize properly
    originalProfile.value = { ...userStore.profile }
  }
})

function startEditing() {
  isEditing.value = true
  originalProfile.value = { ...userStore.profile }
}

async function saveProfile() {
  const success = await userStore.updateUserProfile()
  if (success) {
    isEditing.value = false
    originalProfile.value = { ...userStore.profile }
  }
}

function cancelEditing() {
  // If originalProfile has been properly initialized
  if (originalProfile.value &&
      'id' in originalProfile.value &&
      'name' in originalProfile.value &&
      'email' in originalProfile.value) {
    userStore.profile = { ...originalProfile.value as UserProfileInterface }
  } else {
    // Use default values from the store
    console.warn("Original profile is not properly initialized");
    isEditing.value = false;
  }
  isEditing.value = false
}

// Password change functions
function startPasswordChange() {
  // Reset password fields
  passwordData.value.newPassword = '';
  passwordData.value.confirmPassword = '';
  userStore.error = null;

  // Show password change section
  isChangingPasswordMode.value = true;
}

function cancelPasswordChange() {
  // Hide password change section
  isChangingPasswordMode.value = false;

  // Clear any errors
  userStore.error = null;
}

function confirmPasswordChange() {
  // Validate passwords match before showing confirmation
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    userStore.error = "Passwords do not match";
    return;
  }

  if (passwordData.value.newPassword.length < 6) {
    userStore.error = "Password must be at least 6 characters";
    return;
  }

  // Clear any previous errors
  userStore.error = null;

  // Show confirmation modal
  showPasswordModal.value = true;
}

async function changePassword() {
  isChangingPassword.value = true;

  try {
    const success = await userStore.changePassword(
      passwordData.value.newPassword,
      passwordData.value.confirmPassword
    );

    if (success) {
      // Reset form
      passwordData.value.newPassword = '';
      passwordData.value.confirmPassword = '';
      showPasswordModal.value = false;
      isChangingPasswordMode.value = false;

      // Show success message (you could use a toast here if available)
      alert('Password changed successfully');
    }
  } finally {
    isChangingPassword.value = false;
  }
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

/* New styles for password section and modal */
.password-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.error-text {
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
</style>

