import { defineStore } from "pinia";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import type {
  CreateFinalReportRequestInterface,
  CreateFinalReportResponseInterface
} from '../interfaces/finalReport.interface.ts'
import axios from 'axios'


const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useFinalReportStore = defineStore('finalReport', {
    state: () => ({
      loading: false,
      error: null as null | string,
    }),
    actions: {
      async create(body, token: string): Promise<boolean> {

        function base64ToBlob(base64, contentType = "application/pdf") {
          const byteCharacters = atob(base64); // Decode Base64
          const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: contentType });
        }

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
            // Buat URL untuk Blob
            const blob = base64ToBlob(data.data.pdf);
            const url = URL.createObjectURL(blob);

            // Buat elemen <a> untuk trigger download
            const a = document.createElement("a");
            a.href = url;
            a.download = data.data.fileName; // Nama file yang di-download
            document.body.appendChild(a);
            a.click();

            // Bersihkan URL object
            window.URL.revokeObjectURL(url);

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
      }
}
})
