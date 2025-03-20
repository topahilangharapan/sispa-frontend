import { defineStore } from 'pinia'
import type { CommonResponseInterface } from '../interfaces/common.interface'
import { useAuthStore } from '../stores/auth.ts'
import type { UserStateInterface, UserProfileInterface } from '../interfaces/user.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL

export const useUserStore = defineStore('user', {
  state: (): UserStateInterface => ({
    loading: false,
    error: null,
    profile: {
      id: 0,
      name: '',
      email: '',
      address: '',
      phoneNumber: '',
      placeOfBirth: '',    
      dateOfBirth: '',   
      role: '',         
    },
  }),

  actions: {
    /**
     * Fetch user by ID (POST /api/user/get)
     * The backend expects { "id": number } in the body.
     */
    async fetchUser(userId?: number, username?: string): Promise<boolean> {
        const authStore = useAuthStore();
      
        this.loading = true;
        this.error = null;
      
        try {
          const response = await fetch(`${apiUrl}/user/get`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authStore.token}`,
            },
            body: JSON.stringify({ 
                id: userId || null,
                username: username || null 
              }),
          });

        const data: CommonResponseInterface<UserProfileInterface[]> = await response.json();
        if (!response.ok) {
          this.error = data.message || "Failed to fetch user profile";
          return false;
        }

        // "data.data" might be an array of user objects
        if (data.data && data.data.length > 0) {
          const user = data.data[0];

          // Fill local store
          this.profile = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address || "",
            phoneNumber: user.phoneNumber || "",
            placeOfBirth: user.placeOfBirth || "",  // if your backend returns this
            dateOfBirth: user.dateOfBirth || "",    // if your backend returns this
            role: user.role || "",                  // if your backend returns this
          };
        }
        return true; // success
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },


    async updateUserProfile(): Promise<boolean> {
      const authStore = useAuthStore();

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/user/update-profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            userRequestDTO: {
              id: this.profile.id,
            },
            profileRequestDTO: {
              name: this.profile.name,
              email: this.profile.email,
              address: this.profile.address,
              phoneNumber: this.profile.phoneNumber,
              placeOfBirth: this.profile.placeOfBirth,  // new
              dateOfBirth: this.profile.dateOfBirth,    // new
              role: this.profile.role,                  // new
            },
          }),
        });

        const data: CommonResponseInterface<any> = await response.json();
        if (!response.ok) {
          // non-200
          this.error = data.message || "Failed to update profile";
          return false;
        }
        // If the server returns updated user data, you can reassign this.profile here:
        // if (data.data) { this.profile = { ...this.profile, ...data.data } }

        return true; // success
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Change user password with validation
     * Requires newPassword and confirmationPassword to match
     */
    async changePassword(newPassword: string, confirmationPassword: string): Promise<boolean> {
      // Validate passwords match
      if (newPassword !== confirmationPassword) {
        this.error = "Passwords do not match";
        return false;
      }

      const authStore = useAuthStore();
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/user/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authStore.token}`,
          },
          body: JSON.stringify({
            userId: this.profile.id,
            newPassword: newPassword
          }),
        });

        const data: CommonResponseInterface<any> = await response.json();
        if (!response.ok) {
          this.error = data.message || "Failed to change password";
          return false;
        }

        return true; // success
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
