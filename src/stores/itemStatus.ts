import { defineStore } from 'pinia'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type { ItemStatusInterface } from '../interfaces/item.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useItemStatusStore = defineStore('itemStatus', {
  state: () => ({
    statuses: [] as ItemStatusInterface[],
    loading: false,
    error: null as null | string,
  }),
  actions: {
    async fetchAll(token: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/item/status/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<ItemStatusInterface[]> = await response.json();

        if (response.ok) {
          this.statuses = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Item Status.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateItemStatus(itemId: number, itemStatusId: number, token: string) {
      this.loading = true;
      this.error = null;

      try {
        console.log("Updating item status with itemId:", itemId, "and itemStatusId:", itemStatusId);

        const response = await fetch(`${apiUrl}/item/update-status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: itemId,
            idItemStatus: itemStatusId,
          }),
        });

        const data: CommonResponseInterface<ItemStatusInterface> = await response.json();

        if (response.ok) {
          window.$toast('success', `Berhasil mengupdate status item dengan ID ${data.data.id}`);
          return true;
        } else {
          window.$toast('error', `Gagal mengupdate status item: ${data.message}`);
          return false;
        }
      } catch (err) {
        this.error = `Gagal mengupdate status item: ${(err as Error).message}`;
        window.$toast('error', this.error);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});
