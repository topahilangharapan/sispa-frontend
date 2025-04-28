import { defineStore } from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type {
  CreateItemRequestInterface, CreateItemResponseInterface,
  ItemCategoryInterface, ItemInterface
} from '../interfaces/item.interface.ts'
import router from '../router'
import { useAuthStore } from './auth.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useItemStore = defineStore('item', {
  state: () => ({
    loading: false,
    error: null as null | string,
    itemCategories: [] as ItemCategoryInterface[],
    items: [] as ItemInterface[],
    currentItem: null as ItemInterface | null,
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
    async getItemById(token: String, id: string) {
      this.loading = true
      this.error = null

      try {
          const response = await fetch(apiUrl + `/item/${id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })

          const data: CommonResponseInterface<ItemInterface> = await response.json()
          this.currentItem = data.data
        } catch (err) {
          this.error = `Failed to fetch items ${err}`
        } finally {
          this.loading = false
        }
    },

    async updateItem(itemData: CreateItemRequestInterface, itemId: string, token: string) {
      this.loading = true
      this.error = null

      try {
        console.log("Updating item with data:", itemData, itemId);
        const response = await fetch(`${apiUrl}/item/update`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: itemId,
            ...itemData
          }),
        })

        const data: CommonResponseInterface<ItemInterface> = await response.json()
        if (response.ok) {
          window.$toast('success', `Berhasil mengupdate item dengan ID ${data.data.id}`)
          await this.getItems(token as string)
          return true
        } else {
          window.$toast('error', `Gagal mengupdate item: ${data.message}`)
          return false
        }
      } catch (err) {
        this.error = `Gagal mengupdate item: ${(err as Error).message}`
        window.$toast('error', this.error)
        return false
      } finally {
        this.loading = false
      }
    },

    async deleteItem(id: number) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl + `/item/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          this.items = this.items.filter((item) => item.id !== id);
          window.$toast('success', `Berhasil menghapus item dengan ID ${id}`);
          await router.push("/purchasing/item");
        } else {
          const data = await response.json();
          window.$toast('error', `Gagal menghapus item: ${data.message}`);
        }
      } catch (err) {
        this.error = `Gagal menghapus item: ${(err as Error).message}`;
        window.$toast('error', this.error);
      } finally {
        this.loading = false;
      }
    },

    async getAllItems(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/item/all', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<ItemInterface[]> = await response.json()
        this.items = data.data

      } catch (err) {
        this.error = `Failed to fetch items ${err}`
      } finally {
        this.loading = false
      }
    },

    // async deleteItem(id: number) {
    //   this.loading = true
    //   this.error = null
    //
    //   try {
    //     const response = await fetch(apiUrl + `/item/${id}/delete`, {
    //       method: 'PUT',
    //       headers: {
    //         'Authorization': `Bearer ${useAuthStore().token}`,
    //         'Content-Type': 'application/json'
    //       },
    //     });
    //
    //     if (response.ok) {
    //       this.items = this.items.filter((item) => item.id !== id);
    //       window.$toast('success', `Berhasil menghapus item dengan ID ${id}`);
    //       await router.push("/purchasing/item");
    //     } else {
    //       const data = await response.json();
    //       window.$toast('error', `Gagal menghapus item: ${data.message}`);
    //     }
    //   } catch (err) {
    //     this.error = `Gagal menghapus item: ${(err as Error).message}`;
    //     window.$toast('error', this.error);
    //   } finally {
    //     this.loading = false;
    //   }
    // }

  }
})
