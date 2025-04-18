import {defineStore} from "pinia";
import { useAuthStore } from './auth.ts'
import router from '../router'
import type { ClientInterface, ClientRequestInterface } from '../interfaces/client.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useClientStore = defineStore ('client', {
  state: () => ({
    clients: [] as ClientInterface[],
    loading: false,
    error: null as null | string,
    currentClient: null as ClientInterface | null,
    phoneExists: false,
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
        const response = await fetch(apiUrl + `/client/${id}`, {
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

    async checkPhoneExists(phone: string, currentClientId: string) {
      this.loading = true
      this.error = null
      this.phoneExists = false

      try {
        // First ensure we have the latest client list
        if (this.clients.length === 0) {
          await this.getClients(useAuthStore().token as string)
        }

        // Check if another client has this phone number
        const phoneExists = this.clients.some(
          client => client.contact === phone && client.id !== currentClientId
        )

        this.phoneExists = phoneExists
        return phoneExists
      } catch (err) {
        this.error = `Failed to check phone number: ${(err as Error).message}`
        window.$toast('error', this.error)
        return false
      } finally {
        this.loading = false
      }
    },

    async updateClient(clientData: ClientRequestInterface, clientId: string) {
      this.loading = true
      this.error = null

      try {
        // Check if phone already exists for another client
        const phoneExists = await this.checkPhoneExists(clientData.contact, clientId)
        
        if (phoneExists) {
          window.$toast('error', 'Nomor telepon sudah digunakan oleh klien lain.')
          return false
        }

        const response = await fetch(`${apiUrl}/client/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: clientId,
            ...clientData
          }),
        })

        const data: CommonResponseInterface<ClientInterface> = await response.json()

        if (response.ok) {
          window.$toast('success', `Berhasil mengupdate client dengan ID ${data.data.id}`)
          await this.getClients(useAuthStore().token as string)
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
    },

    async deleteClient(id: string){
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl + `/client/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          this.clients = this.clients.filter((client) => client.id !== id);
          window.$toast('success', `Berhasil menghapus klien dengan ID ${id}`);
          await router.push("/marketing/client");
        } else {
          const data = await response.json();
          window.$toast('error', `Gagal menghapus klien: ${data.message}`);
        }
      } catch (err) {
        this.error = `Gagal menghapus klien: ${(err as Error).message}`;
        window.$toast('error', this.error ?? 'Terjadi kesalahan')
      } finally {
        this.loading = false;
      }
    },

    async addClient(body: ClientRequestInterface) {
      this.loading = true
      this.error = null

      try {
        // Check if phone already exists
        const phoneExists = await this.checkPhoneExists(body.contact, '')
        
        if (phoneExists) {
          window.$toast('error', 'Nomor telepon sudah digunakan oleh klien lain.')
          return false
        }

        const response = await fetch(apiUrl + '/client/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
        const data: CommonResponseInterface<ClientInterface> =
          await response.json()
        if (response.ok) {
          window.$toast('success', "Berhasil menambahkan klien dengan ID " + data.data.id);
          await router.push("/marketing/client")
          return true;
        } else {
          window.$toast('error', "Gagal menambahkan klien: " + data.message);
          return false;
        }

      } catch (err) {
        this.error = `Gagal menambahkan klien: ${(err as Error).message}`

        window.$toast('error', this.error ?? 'Terjadi kesalahan')
      } finally {
        this.loading = false
      }
    },
  }
})