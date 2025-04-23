import { defineStore } from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type {
  CreateItemRequestInterface, CreateItemResponseInterface,
  ItemCategoryInterface, ItemInterface
} from '../interfaces/item.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useItemStore = defineStore('item', {
  state: () => ({
    loading: false,
    error: null as null | string,
    itemCategories: [] as ItemCategoryInterface[],
    items: [] as ItemInterface[],
  }),
  actions: {

    async create(body: CreateItemRequestInterface, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + "/item/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: CommonResponseInterface<CreateItemResponseInterface> =
          await response.json();

        if (response.ok) {

          window.$toast("success", "Item berhasil dibuat!");
          return true;
        } else {
          window.$toast("error", "Gagal membuat Item: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", "Gagal membuat Item: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getItemCategories(token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/category/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<ItemCategoryInterface[]> = await response.json();

        if (response.ok) {
          this.itemCategories = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Item Categories.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getItems(token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/item/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<ItemInterface[]> = await response.json();

        if (response.ok) {
          this.items = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Items.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

  }
})
