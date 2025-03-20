import { defineStore } from "pinia";

import axios from 'axios'
import type {
  CreateFinalReportRequestInterface,
  CreateFinalReportResponseInterface,
  FinalReportInterface
} from '../interfaces/finalReport.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useFinalReportStore = defineStore('finalReport', {
  state: () => ({
    loading: false,
    error: null as null | string,
    finalReports: [] as FinalReportInterface[],
    selectedFinalReport: null as FinalReportInterface | null,
    pdfBase64: null as string | Blob | null,
    pdfFileName: null as string | null, // Tambahkan untuk menyimpan nama file
  }),
  actions: {
    async create(body: CreateFinalReportRequestInterface | FormData, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(apiUrl + '/final-report/create', body, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })

        const data: CommonResponseInterface<CreateFinalReportResponseInterface> = response.data;

        if (response.status >= 200 && response.status < 300) {
          window.$toast('success', "Final Report berhasil dibuat!");
          return true;
        } else {
          window.$toast('error', "Gagal membuat Final Report: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast('error', "Gagal membuat Final Report: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchAll(token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/final-report/all`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<FinalReportInterface[]> = await response.json();

        if (response.ok) {
          this.finalReports = data.data || [];
          return true; // success
        } else {
          this.error = data.message || "Failed to fetch final report.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchDetail(id: number, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;
      this.selectedFinalReport = null;

      try {
        const response = await fetch(`${apiUrl}/final-report/${id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<FinalReportInterface> = await response.json();

        if (response.ok) {
          this.selectedFinalReport = data.data;
          return true;
        } else {
          this.error = data.message || "Failed to fetch final report detail.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    async downloadReport() {
      if (!this.pdfBase64 || !this.pdfFileName) {
        window.$toast("error", "Tidak ada file untuk diunduh!");
        return false;
      }

      if (typeof this.pdfBase64 !== "string") {
        window.$toast("error", "Format file tidak valid!");
        return false;
      }

      function base64ToBlob(base64: string, contentType = "application/pdf") {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: contentType });
      }

      const blob = base64ToBlob(this.pdfBase64);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = this.pdfFileName;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);

      return true;
    }

  }
})
