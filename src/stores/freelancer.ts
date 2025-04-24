import { defineStore } from "pinia";
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type {
  CreateFreelancerRequestInterface, CreateFreelancerResponseInterface,
  WorkExperienceCategoryInterface
} from '../interfaces/freelancer.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useFreelancerStore = defineStore('freelancer', {
  state: () => ({
    loading: false,
    error: null as null | string,
    workExperienceCategories: [] as WorkExperienceCategoryInterface[]
  }),
  actions: {

    async add(body: CreateFreelancerRequestInterface, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + "/freelancer/add", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: CommonResponseInterface<CreateFreelancerResponseInterface> =
          await response.json();

        if (response.ok) {
          window.$toast("success", "Freelancer berhasil ditambahkan!");
          return true;
        } else {
          window.$toast("error", "Gagal menambahkan Freelancer: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", "Gagal menambahkan Freelancer: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getWorkExperienceCategories(token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/work-experience/category/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<WorkExperienceCategoryInterface[]> = await response.json();

        if (response.ok) {
          this.workExperienceCategories = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch Work Experience Categories.";
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
