import { defineStore } from "pinia";
import { useAuthStore } from '../stores/auth.ts';

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
    pdfBase64: null as string | null,
    pdfFileName: null as string | null,
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

    async downloadFinalReport(id: number, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        // Make request to download endpoint
        const response = await fetch(`${apiUrl}/final-report/${id}/download`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if response is successful
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Get the filename from the Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `FinalReport_${id}.pdf`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }

        // Convert response to blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create download link and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up URL object
        window.URL.revokeObjectURL(url);

        window.$toast("success", "Laporan akhir berhasil di-download!");
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        window.$toast("error", `Gagal mengunduh laporan akhir: ${errorMessage}`);
        console.error(error);
        this.error = errorMessage;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteFinalReport(id: number){
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl + `/final-report/${id}/delete`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.ok) {
          this.finalReports = this.finalReports.filter((finalReport) => finalReport.id !== id);
          window.$toast('success', `Berhasil menghapus laporan akhir dengan ID ${id}`);
        } else {
          const data = await response.json();
          window.$toast('error', `Gagal menghapus laporan akhir: ${data.message}`);
        }
      } catch (err) {
        this.error = `Gagal menghapus laporan akhir: ${(err as Error).message}`;
        window.$toast('error', this.error);
      } finally {
        this.loading = false;
      }
    }
  }

})
