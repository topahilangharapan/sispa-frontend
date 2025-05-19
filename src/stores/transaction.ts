import {defineStore} from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type { CategoryInterface } from '../interfaces/category.interface.ts'
import type {
  AddTransactionRequestInterface,
  AddTransactionResponseInterface
} from '../interfaces/transaction.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useTransactionStore = defineStore ('transaction', {
  state: () => ({
    loading: false,
    error: null as null | string,
    categories: [] as CategoryInterface[],
  }),
  actions: {
    async getCategories(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/transaction/category/all', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<CategoryInterface[]> = await response.json()

        this.categories = data.data
      } catch (err) {
        this.error = `Gagal mengambil data Categories: ${err}`
        window.$toast('error', this.error);
      } finally {
        this.loading = false
      }
    },

    async add(body: AddTransactionRequestInterface, type: string, token: string): Promise<boolean> {

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + '/transaction/' + type + '/add',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
          },
        )

        const data: CommonResponseInterface<AddTransactionResponseInterface> = await response.json();

        if (response.ok) {
          window.$toast('success', "Transaction berhasil dicatat!");
          return true;
        } else {
          window.$toast('error', "Gagal mencatat Transaction : " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast('error', "Gagal mencatat Transaction: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },
  }
})
