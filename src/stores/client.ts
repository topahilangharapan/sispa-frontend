import {defineStore} from "pinia";
import type {
  ClientInterface,
  ClientRequestInterface
} from '@/interfaces/client.interface.ts'

import type { CommonResponseInterface } from '@/interfaces/common.interface'
import { useAuthStore } from './auth.ts'
import router from '../router'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useClientStore = defineStore ('client', {
  state: () => ({
    clients: [] as ClientInterface[],
    loading: false,
    error: null as null | string,
    currentClient: null as ClientInterface | null,
  }),
  actions: {
    async getClients(token: String) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/client/viewall', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<ClientInterface[]> = await response.json()
        this.clients = data.data
      } catch (err) {
        this.error = `Failed to fetch clients ${err}`
      } finally {
        this.loading = false
      }
    },
    async getClientById(token: String, id: String) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`http://localhost:8080/api/client/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<ClientInterface> = await response.json()
        this.currentClient = data.data
      } catch (err) {
        this.error = `Failed to fetch clients ${err}`
      } finally {
        this.loading = false
      }
    },

    async updateClient(body: ClientRequestInterface) {
      this.loading = true
      this.error = null
    
      try {
        
        const response = await fetch(`${apiUrl}/client/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
        
        const data: CommonResponseInterface<ClientInterface> = await response.json()
        
        if (response.ok) {
          window.$toast('success', `Berhasil mengupdate client dengan ID ${data.data.id}`)
          await this.getClients(useAuthStore().token) 
          return true
        } else {
          window.$toast('error', `Gagal mengupdate client: ${data.message}`)
          return false
        }
      } catch (err) {
        this.error = `Gagal mengupdate client: ${(err as Error).message}`
        window.$toast('error', this.error)
        return false
      } finally {
        this.loading = false
      }
    }
  }
})