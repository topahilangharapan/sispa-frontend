<template>
    <div class="freelancer-container">
      <VNavbar :title="title" :submodules="submodules"></VNavbar>
  
      <div class="freelancer-card">
        <h2>Freelancer Detail</h2>
  
        <p v-if="freelancerStore.loading">Loading...</p>
        <p v-if="freelancerStore.error" style="color:red;">
          {{ freelancerStore.error }}
        </p>
  
        <div v-if="selectedFreelancer" class="detail-content">
          <!-- Personal Information -->
          <div class="section">
            <h3>Personal Information</h3>
            <div class="detail-field">
              <label>Name</label>
              <p>{{ selectedFreelancer.name }}</p>
            </div>
  
            <div class="detail-field">
              <label>Email</label>
              <p>{{ selectedFreelancer.email }}</p>
            </div>
  
            <div class="detail-field">
              <label>Phone Number</label>
              <p>{{ selectedFreelancer.phoneNumber }}</p>
            </div>
  
            <div class="detail-field">
              <label>Address</label>
              <p>{{ selectedFreelancer.address }}</p>
            </div>
  
            <div class="detail-field">
              <label>Place of Birth</label>
              <p>{{ selectedFreelancer.placeOfBirth }}</p>
            </div>
  
            <div class="detail-field">
              <label>Date of Birth</label>
              <p>{{ selectedFreelancer.dateOfBirth }}</p>
            </div>
  
            <div class="detail-field">
              <label>NIK</label>
              <p>{{ selectedFreelancer.nik }}</p>
            </div>
          </div>
  
          <!-- Education and Status -->
          <div class="section">
            <h3>Education & Status</h3>
            <div class="detail-field">
              <label>Education Level</label>
              <p>{{ selectedFreelancer.education }}</p>
            </div>
  
            <div class="detail-field">
              <label>Working Status</label>
              <p>{{ selectedFreelancer.isWorking ? 'Currently Working' : 'Not Working' }}</p>
            </div>
  
            <div class="detail-field">
              <label>Reason for Joining</label>
              <p>{{ selectedFreelancer.reason }}</p>
            </div>
          </div>
  
          <!-- Work Experience -->
          <div class="section">
            <h3>Work Experience</h3>
            <div v-if="selectedFreelancer.workExperiences && selectedFreelancer.workExperiences.length > 0">
              <div v-for="(experience, index) in selectedFreelancer.workExperiences" 
                   :key="experience.tempId" 
                   class="experience-card">
                <h4>Experience {{ index + 1 }}</h4>
                <div class="detail-field">
                  <label>Category</label>
                  <p>{{ experience.category }}</p>
                </div>
                <div class="detail-field">
                  <label>Title</label>
                  <p>{{ experience.title }}</p>
                </div>
                <div class="detail-field">
                  <label>Description</label>
                  <p>{{ experience.description }}</p>
                </div>
                <div class="detail-field">
                  <label>Period</label>
                  <p>{{ experience.startDate }} - {{ experience.isStillWorking ? 'Present' : experience.endDate }}</p>
                </div>
              </div>
            </div>
            <p v-else>No work experience recorded.</p>
          </div>
  
          <div class="actions">
            <VButton variant="primary" size="md" @click="goBack">
              Back to List
            </VButton>
            <VButton 
              v-if="!selectedFreelancer.approvedAt" 
              variant="primary" 
              size="md" 
              @click="approveFreelancer"
              :disabled="freelancerStore.loading"
            >
              {{ freelancerStore.loading ? 'Processing...' : 'Approve Freelancer' }}
            </VButton>
            <div v-else class="approved-status">
              <span class="approved-badge">✓ Approved</span>
              <span class="approved-date">on {{ formatDate(selectedFreelancer.approvedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useFreelancerStore } from '../stores/freelancer'
  import { useAuthStore } from '../stores/auth'
  import { useRoute, useRouter } from 'vue-router'
  import { onMounted, ref, computed } from 'vue'
  import VButton from '../components/VButton.vue'
  import VNavbar from '../components/VNavbar.vue'
  
  const freelancerStore = useFreelancerStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  
  const title = ref({ 'Freelancer': '/freelancer' })
  const submodules = ref({
    "Pendaftar": "/freelancer/applications"
  });
  
  // Get the selected freelancer from the store directly
  const selectedFreelancer = computed(() => {
    return freelancerStore.selectedFreelancer
  })
  
  onMounted(async () => {
    if (!authStore.token) return
    
    // Get the freelancer by ID
    const freelancerId = Number(route.params.id)
    await freelancerStore.getFreelancerById(freelancerId, authStore.token)
  })
  
  function goBack() {
    router.push('/freelancer')
  }
  
  async function approveFreelancer() {
    if (!authStore.token || !selectedFreelancer.value) return
    
    const success = await freelancerStore.approveFreelancer(
      selectedFreelancer.value.id, 
      authStore.token
    )
    
    if (success) {
      // Refresh the freelancer data
      await freelancerStore.getFreelancerById(selectedFreelancer.value.id, authStore.token)
    }
  }
  
  function formatDate(date: string | null) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  </script>
  
  <style scoped>
  .freelancer-container {
    justify-content: center;
    align-items: center;
    width: 1200px;
    padding-top: 50px;
    padding-left: 150px;
  }
  
  .freelancer-card {
    background: white;
    width: 70%;
    max-width: 900px;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: left;
  }
  
  .section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .section h3 {
    color: #2c3e50;
    margin-bottom: 20px;
  }
  
  .detail-field {
    margin-bottom: 15px;
  }
  
  .detail-field label {
    font-weight: bold;
    display: block;
    color: #666;
    font-size: 0.9em;
    margin-bottom: 5px;
  }
  
  .detail-field p {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin: 0;
    color: #2c3e50;
  }
  
  .experience-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .experience-card h4 {
    color: #2c3e50;
    margin-bottom: 15px;
  }
  
  .actions {
    margin-top: 30px;
    display: flex;
    gap: 15px;
    align-items: center;
  }
  
  .approved-status {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
  }
  
  .approved-badge {
    background-color: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9em;
  }
  
  .approved-date {
    font-size: 0.8em;
    color: #666;
    margin-top: 5px;
  }
  </style>