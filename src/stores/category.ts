import { defineStore } from "pinia";
import type { CategoryInterface, CategoryRequestResponseInterface } from '../interfaces/category.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useCategoryStore = defineStore('category', {
  state: () => ({
    loading: false,
    error: null as null | string,
    categories: [] as CategoryInterface[],
    selectedCategory: null as CategoryInterface | null,
  }),
  actions: {

    async create(body: CategoryInterface, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + "/category/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: CommonResponseInterface<CategoryRequestResponseInterface> =
          await response.json();

        if (response.ok) {

          window.$toast("success", "Category berhasil dibuat!");
          return true;
        } else {
          window.$toast("error", "Gagal membuat Category: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", "Gagal membuat Category: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    async fetchAll(token: string): Promise<boolean> {
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

        const data: CommonResponseInterface<CategoryInterface[]> = await response.json();

        if (response.ok) {
          this.categories = data.data || [];
          return true; // success
        } else {
          this.error = data.message || "Failed to fetch categories.";
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
