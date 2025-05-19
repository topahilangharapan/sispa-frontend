import {defineStore} from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type { AccountInterface } from '../interfaces/account.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useAccountStore = defineStore ('account', {
  state: () => ({
    accounts: [] as AccountInterface[],
    loading: false,
    error: null as null | string,
  }),
  actions: {
    async getAccounts(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/account/all', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<AccountInterface[]> = await response.json()
        this.accounts = data.data
      } catch (err) {
        this.error = `Gagal mengambil data Account: ${err}`
        window.$toast('error', this.error);
      } finally {
        this.loading = false
      }
    },
  }
})
