import { defineStore } from "pinia";
import { jwtDecode } from 'jwt-decode';


const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

import type {
  UserInterface,
  LoginRequestInterface,
  LoginResponseInterface, RegisterRequestInterface, RegisterResponseInterface, RoleResponseInterface
} from '../interfaces/auth.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

export const useAuthStore = defineStore('auth', {
    state: () => ({
      loading: false,
      error: null as null | string,
      user: null as null | UserInterface,
      token: null as null | string,
    }),
    actions: {
      async login(body: LoginRequestInterface): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(apiUrl + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          const data: CommonResponseInterface<LoginResponseInterface> = await response.json();

          if (response.ok) {
            const decodedToken = jwtDecode<any>(data.data.token);
            const userDetail: UserInterface = {
              username: decodedToken.sub || "",
              name: decodedToken.name || "",
              role: decodedToken.role || "",
            };

            this.user = userDetail;
            this.token = data.data.token;

            window.$toast('success', "Login successful");
            return true; // Login berhasil
          } else {
            window.$toast('error', "Gagal Login: " + data.message);
            return false; // Login gagal
          }
        } catch (err) {
          this.error = (err as Error).message;
          window.$toast('error', "Gagal Login: " + this.error);
          return false; // Login gagal karena error
        } finally {
          this.loading = false;
        }
      },

      async loginAsAGuest() {
        this.loading = true;
        this.error = null;

        try {
          this.user = null;
          this.token = null;

          const userDetail: UserInterface = {
            username: 'guest', // Biasanya sub berisi username
            name: "guest",
            role: "guest",
          };

          this.user = userDetail;
          this.token = "guest";

          window.$toast('success', "Login successful");

        } catch (err) {

          this.error = (err as Error).message;
          window.$toast('error',"Gagal Login: " + this.error);
          return false; // Login gagal karena error

        } finally {
          this.loading = false;
        }
      },

      async logout() {
        this.loading = true;
        this.error = null;

        try {
          this.user = null;
          this.token = null;

          window.$toast('success', "Logout successful");

        } catch (err) {

          this.error = (err as Error).message;
          window.$toast('error', "Gagal Logout: " + this.error);
          return false; // Login gagal karena error

        } finally {
          this.loading = false;
        }
      },

      async register(body: RegisterRequestInterface): Promise<boolean> {
        this.loading = true
        this.error = null

        try {
          const response = await fetch(apiUrl + '/user/add',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.token}`, // Pastikan token benar
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body),
            },
          )

          const data: CommonResponseInterface<RegisterResponseInterface> =
            await response.json()
          if (response.ok) {
            window.$toast('success', "Berhasil menambahkan user dengan username " + data.data.username);
            return true;
          } else {
            window.$toast('error', "Gagal menambahkan user: " + data.message);
            return false;
          }

        } catch (err) {
          this.error = `Gagal menambahkan user: ${(err as Error).message}`

          window.$toast('error', this.error);
          return false;
        } finally {
          this.loading = true
        }
      },

      async getRoles() {
        this.loading = true
        this.error = null

        try {
          console.log(`Bearer ${this.token}`)
          const response = await fetch(apiUrl + '/role/all',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${this.token}`, // Pastikan token benar
                'Content-Type': 'application/json'
              }
            },
          )

          const data: CommonResponseInterface<RoleResponseInterface> =
            await response.json()

          if (response.ok) {
            return data;
          } else {
            window.$toast('error', "Gagal mendapatkan daftar role: " + data.message);
          }

        } catch (err) {
          this.error = `Gagal mendapatkan daftar role: ${(err as Error).message}`

          window.$toast("error", this.error);
        } finally {
          this.loading = false
        }
      },
    },
    persist: true // Aktifkan persist agar data tetap ada
})
