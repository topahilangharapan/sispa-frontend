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

    async downloadFinalReport(id: number, token:string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/final-report/${id}/download`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const blob = await response.blob(); // Ubah respons ke Blob
        const url = window.URL.createObjectURL(blob);

        // Buat elemen <a> untuk download
        const a = document.createElement("a");
        a.href = url;
        a.download = `FinalReport_${id}.pdf`; // Nama file default
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
        window.$toast("success", "Final report berhasil di-download!");
      } catch (error) {
        window.$toast("error", "Gagal mengunduh final report!");
        console.error(error);
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
