<template>
  <div class="profile-container">
    <VNavbar title="User Profile" />
    <div class="profile-card">
      <h2>General</h2>

      <div class="profile-field">
        <label>Name</label>
        <p v-if="!isEditing">{{ profile.name }}</p>
        <VInputField v-else v-model="profile.name" />
      </div>

      <div class="profile-field">
        <label>Email address</label>
        <p v-if="!isEditing">{{ profile.email }}</p>
        <VInputField v-else v-model="profile.email" />
      </div>

      <div class="profile-field">
        <label>Address</label>
        <p v-if="!isEditing">{{ profile.address }}</p>
        <VInputField v-else v-model="profile.address" />
      </div>

      <div class="profile-field">
        <label>Phone Number</label>
        <p v-if="!isEditing">{{ profile.phoneNumber }}</p>
        <VInputField v-else v-model="profile.phoneNumber" />
      </div>

      <div class="actions">
        <VButton 
          v-if="!isEditing" 
          size="md" 
          @click="isEditing = true"
        >
          Edit Profile
        </VButton>
        <VButton 
          v-if="isEditing" 
          size="md" 
          @click="updateProfile"
        >
          Save
        </VButton>
        <VButton 
          v-if="isEditing" 
          size="md" 
          @click="resetProfile"
        >
          Cancel
        </VButton>
      </div>

      <p v-if="loading">Loading...</p>
      <p v-if="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/apiClient'; // Updated import path
import VNavbar from '../components/VNavbar.vue';
import VButton from '../components/VButton.vue';
import VInputField from '../components/VInputField.vue';

// User profile state
const profile = ref({
  name: '',
  email: '',
  address: '',
  phoneNumber: '',
});

const originalProfile = ref({});
const isEditing = ref(false);
const loading = ref(false);
const error = ref(null);

// Fetch user profile data
const fetchProfile = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.post('/api/user/get', { id: 1 }); // Replace with logged-in user ID
    if (response.data.data.length > 0) {
      profile.value = response.data.data[0]; // API response structure
      originalProfile.value = { ...profile.value };
    }
  } catch (err) {
    error.value = "Failed to load profile data";
    console.error('Error fetching profile:', err);
  } finally {
    loading.value = false;
  }
};

// Update user profile
const updateProfile = async () => {
  loading.value = true;
  error.value = null;

  try {
    await apiClient.put('/api/user/update-profile', {
      // First RequestBody - UserRequestDTO
      userRequestDTO: {
        id: profile.value.id  // or however you store the user ID
      },
      // Second RequestBody - UserProfileRequestDTO
      profileRequestDTO: {
        name: profile.value.name,
        email: profile.value.email,
        address: profile.value.address,
        phoneNumber: profile.value.phoneNumber,
      }
    });

    isEditing.value = false;
  } catch (err) {
    error.value = "Failed to update profile";
    console.error('Error updating profile:', err);
  } finally {
    loading.value = false;
  }
};

// Reset form if user cancels edit
const resetProfile = () => {
  profile.value = { ...originalProfile.value };
  isEditing.value = false;
};

// Fetch profile data on page load
onMounted(fetchProfile);
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Vertically centered */
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
  justify-content: start;
  gap: 15px;
}
</style>
