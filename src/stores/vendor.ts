import {defineStore} from "pinia";
import type {
  VendorInterface,
  VendorRequestInterface
} from '@/interfaces/vendor.interface.ts'

import type { CommonResponseInterface } from '@/interfaces/common.interface'
import { useAuthStore } from './auth.ts'
import router from '../router'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useVendorStore = defineStore ('vendor', {
  state: () => ({
    vendors: [] as VendorInterface[],
    loading: false,
    error: null as null | string,
    currentVendor: null as VendorInterface | null,
  }),
  actions: {
    async getVendors(token: String) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/vendor/viewall', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<VendorInterface[]> = await response.json()
        this.vendors = data.data
      } catch (err) {
        this.error = `Failed to fetch vendors ${err}`
      } finally {
        this.loading = false
      }
    },
    async getVendorById(token: String, id: String) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`http://localhost:8080/api/vendor/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<VendorInterface> = await response.json()
        this.currentVendor = data.data
      } catch (err) {
        this.error = `Failed to fetch vendors ${err}`
      } finally {
        this.loading = false
      }
    },

    async addVendor(body: VendorRequestInterface) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl + '/vendor/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
        const data: CommonResponseInterface<VendorInterface> =
          await response.json()
        if (response.ok) {
          window.$toast('success', "Berhasil menambahkan vendor dengan ID " + data.data.id);
          await router.push("/vendor")
          return true;
        } else {
          window.$toast('error', "Gagal menambahkan vendor: " + data.message);
          return false;
        }

      } catch (err) {
        this.error = `Gagal menambahkan vendor: ${(err as Error).message}`

        window.$toast(this.error);
      } finally {
        this.loading = false
      }
    },

    async updateVendor(body: VendorRequestInterface) {
      this.loading = true
      this.error = null
    
      try {
        
        const response = await fetch(`${apiUrl}/vendor/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
        
        const data: CommonResponseInterface<VendorInterface> = await response.json()
        
        if (response.ok) {
          window.$toast('success', `Berhasil mengupdate vendor dengan ID ${data.data.id}`)
          await this.getVendors(useAuthStore().token) // Refresh vendor list
          return true
        } else {
          window.$toast('error', `Gagal mengupdate vendor: ${data.message}`)
          return false
        }
      } catch (err) {
        this.error = `Gagal mengupdate vendor: ${(err as Error).message}`
        window.$toast('error', this.error)
        return false
      } finally {
        this.loading = false
      }
    }

  }
})
