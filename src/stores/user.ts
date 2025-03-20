// stores/user.store.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '../stores/auth.ts'
import type { UserProfileInterface, UserStateInterface } from '../interfaces/user.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
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
    async fetchUser(userId: number): Promise<boolean> {
      const authStore = useAuthStore();

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/user/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authStore.token}`, // Must be authorized if required
          },
          body: JSON.stringify({ id: userId }),
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

    /**
     * Update the user's profile (PUT /api/user/update-profile)
     * The backend wants a combined request body:
     * {
     *   "userRequestDTO":    { "id": number },
     *   "profileRequestDTO": { "name", "email", "address", "phoneNumber", "placeOfBirth", "dateOfBirth", "role" }
     * }
     */
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
  },
});

//   actions: {
//     async fetchUser(id: number) {
//       this.loading = true
//       this.error = null
//       const authStore = useAuthStore()

//       try {
//         const response = await fetch(`${apiUrl}/user/get`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${authStore.token}`, // <--- Include token here!
//           },
//           body: JSON.stringify({ id }),
//         })

//         if (!response.ok) {
//           if (response.status === 401) {
//             throw new Error('Unauthorized - invalid or missing token')
//           }
//           throw new Error('Failed to fetch user')
//         }

//         const data = await response.json()
//         if (data.data && data.data.length > 0) {
//           const user = data.data[0]
//           this.profile = {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             address: user.address,
//             phoneNumber: user.phoneNumber,
//           }
//         }
//       } catch (err: any) {
//         this.error = err.message
//       } finally {
//         this.loading = false
//       }
//     },

//     async updateUserProfile() {
//       this.loading = true
//       this.error = null
//       const authStore = useAuthStore()

//       try {
//         const response = await fetch(`${apiUrl}/user/update-profile`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${authStore.token}`, // <--- Include token here too!
//           },
//           body: JSON.stringify({
//             userRequestDTO: { id: this.profile.id },
//             profileRequestDTO: {
//               name: this.profile.name,
//               email: this.profile.email,
//               address: this.profile.address,
//               phoneNumber: this.profile.phoneNumber,
//             },
//           }),
//         })

//         if (!response.ok) {
//           if (response.status === 401) {
//             throw new Error('Unauthorized - invalid or missing token')
//           }
//           throw new Error('Failed to update user profile')
//         }

//         const data = await response.json()
//         // ...
//       } catch (err: any) {
//         this.error = err.message
//       } finally {
//         this.loading = false
//       }
//     },
//   },
// })
