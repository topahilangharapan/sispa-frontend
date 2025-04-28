import { defineStore } from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type {
  CreateFreelancerRequestInterface, CreateFreelancerResponseInterface, EducationLevelInterface, FreelancerInterface,
  WorkExperienceCategoryInterface
} from '../interfaces/freelancer.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useFreelancerStore = defineStore('freelancer', {
  state: () => ({
    loading: false,
    error: null as null | string,
    workExperienceCategories: [] as WorkExperienceCategoryInterface[],
    educationLevels: [] as EducationLevelInterface[],
    freelancers: [] as FreelancerInterface[],
    selectedFreelancer: null as FreelancerInterface | null
  }),
  actions: {

    async add(body: CreateFreelancerRequestInterface): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + "/freelancer/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: CommonResponseInterface<CreateFreelancerResponseInterface> =
          await response.json();

        if (response.ok) {
          window.$toast("success", "Freelancer berhasil ditambahkan!");
          return true;
        } else {
          window.$toast("error", "Gagal menambahkan Freelancer: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", "Gagal menambahkan Freelancer: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getWorkExperienceCategories(): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/work-experience/category/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<WorkExperienceCategoryInterface[]> = await response.json();

        if (response.ok) {
          this.workExperienceCategories = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Work Experience Categories.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getEducationLevels(): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/freelancer/education-level/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<EducationLevelInterface[]> = await response.json();

        if (response.ok) {
          this.educationLevels = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Education Levels.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getFreelancers(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/freelancer/viewall', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<FreelancerInterface[]> = await response.json()
        this.freelancers = data.data

      } catch (err) {
        this.error = `Failed to fetch freelancers ${err}`
      } finally {
        this.loading = false
      }
    },
    async getApplicants(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/freelancer/viewall-applicants', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<FreelancerInterface[]> = await response.json()
        this.freelancers = data.data

      } catch (err) {
        this.error = `Failed to fetch freelancers ${err}`
      } finally {
        this.loading = false
      }
    },

    async getFreelancerById(id: number, token: string): Promise<FreelancerInterface | null> {
      // First check if we already have this freelancer in our store
      const existingFreelancer = this.freelancers.find(f => f.id === id)
      
      if (existingFreelancer) {
        this.selectedFreelancer = existingFreelancer
        return existingFreelancer
      }
      
      // If we don't have it and no token provided, return null
      if (!token) {
        this.error = "Authentication token required"
        return null
      }
      
      // Try to fetch directly from the API first
      this.loading = true
      this.error = null
      
      try {
        // Fetch the freelancer by ID from the new API endpoint
        const response = await fetch(`${apiUrl}/freelancer/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        
        if (response.ok) {
          const data: CommonResponseInterface<FreelancerInterface> = await response.json()
          if (data.data) {
            this.selectedFreelancer = data.data
            return data.data
          }
        }
        
        // If direct fetch failed, try the fallback approach
        if (this.freelancers.length === 0) {
          await this.getFreelancers(token)
        }
        
        // Now try to find the freelancer again
        const freelancer = this.freelancers.find(f => f.id === id)
        
        if (freelancer) {
          this.selectedFreelancer = freelancer
          return freelancer
        } else {
          this.error = `Freelancer with ID ${id} not found`
          return null
        }
      } catch (err) {
        this.error = `Failed to fetch freelancer: ${err}`
        return null
      } finally {
        this.loading = false
      }
    },
    
    async approveFreelancer(id: number, token: string): Promise<boolean> {
      if (!token) {
        this.error = "Authentication token required"
        return false
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`${apiUrl}/freelancer/${id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data: CommonResponseInterface<FreelancerInterface> = await response.json()
        
        if (response.ok) {
          // Update the selected freelancer if it matches
          if (this.selectedFreelancer && this.selectedFreelancer.id === id) {
            this.selectedFreelancer = data.data
          }
          
          // Update the freelancer in the list if it exists
          const index = this.freelancers.findIndex(f => f.id === id)
          if (index !== -1) {
            this.freelancers[index] = data.data
          }
          
          window.$toast('success', 'Freelancer berhasil disetujui!')
          return true
        } else {
          window.$toast('error', `Gagal menyetujui freelancer: ${data.message}`)
          this.error = data.message
          return false
        }
      } catch (err) {
        this.error = `Error approving freelancer: ${err}`
        window.$toast('error', `Error approving freelancer: ${err}`)
        return false
      } finally {
        this.loading = false
      }
    },
    
    async updateFreelancerWorkingStatus(id: number, isWorking: boolean, token: string): Promise<boolean> {
      if (!token) {
        this.error = "Authentication token required"
        return false
      }
      
      this.loading = true
      this.error = null
      
      try {
        // Use 'working' instead of 'isWorking' in the request body
        console.log('Sending request with body:', JSON.stringify({ working: isWorking }))
        
        const response = await fetch(`${apiUrl}/freelancer/${id}/update-working-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ working: isWorking })
        })
        
        const data: CommonResponseInterface<FreelancerInterface> = await response.json()
        
        if (response.ok) {
          // Update the selected freelancer if it matches
          if (this.selectedFreelancer && this.selectedFreelancer.id === id) {
            this.selectedFreelancer = data.data
          }
          
          // Update the freelancer in the list if it exists
          const index = this.freelancers.findIndex(f => f.id === id)
          if (index !== -1) {
            this.freelancers[index] = data.data
          }
          
          window.$toast('success', `Status freelancer berhasil diubah menjadi ${isWorking ? 'Sedang Bekerja' : 'Tidak Bekerja'}!`)
          return true
        } else {
          window.$toast('error', `Gagal mengubah status freelancer: ${data.message}`)
          this.error = data.message
          return false
        }
      } catch (err) {
        this.error = `Error updating freelancer status: ${err}`
        window.$toast('error', `Error updating freelancer status: ${err}`)
        return false
      } finally {
        this.loading = false
      }
    },

    async rejectFreelancer(id: number, token: string): Promise<boolean> {
      if (!token) {
        this.error = "Authentication token required"
        return false
      }
      
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(`${apiUrl}/freelancer/${id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data: CommonResponseInterface<FreelancerInterface> = await response.json()
        
        if (response.ok) {
          // Update the selected freelancer if it matches
          if (this.selectedFreelancer && this.selectedFreelancer.id === id) {
            this.selectedFreelancer = data.data
          }
          
          // Update the freelancer in the list if it exists
          const index = this.freelancers.findIndex(f => f.id === id)
          if (index !== -1) {
            this.freelancers[index] = data.data
          }
          
          window.$toast('success', 'Freelancer berhasil ditolak')
          return true
        } else {
          window.$toast('error', `Gagal menolak freelancer: ${data.message}`)
          this.error = data.message
          return false
        }
      } catch (err) {
        this.error = `Error rejecting freelancer: ${err}`
        window.$toast('error', `Error rejecting freelancer: ${err}`)
        return false
      } finally {
        this.loading = false
      }
    }
  }
})
