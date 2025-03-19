import { defineStore } from "pinia";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import type { InvoiceInterface, InvoiceRequestResponseInterface } from '../interfaces/invoice.interface.ts'


const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useInvoiceStore = defineStore('invoice', {
    state: () => ({
      loading: false,
      error: null as null | string,
    }),
    actions: {

      async create(body: InvoiceInterface, token: string): Promise<boolean> {

        function base64ToBlob(base64, contentType = "application/pdf") {
          const byteCharacters = atob(base64); // Decode Base64
          const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: contentType });
        }

        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(apiUrl + '/invoice/create',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body),
            },
          )

          const data: CommonResponseInterface<InvoiceRequestResponseInterface> = await response.json();

          if (response.ok) {
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

            window.$toast('success', "Invoice berhasil dibuat!");
            return true; // Login berhasil
          } else {
            window.$toast('error', "Gagal membuat Invoice: " + data.message);
            return false; // Login gagal
          }
        } catch (err) {
          this.error = (err as Error).message;
          window.$toast('error', "Gagal membuat Invoice: " + this.error);
          return false; // Login gagal karena error
        } finally {
          this.loading = false;
        }
      },
      async fetchAll(token: string): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(`${apiUrl}/invoice/all`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data: CommonResponseInterface<InvoiceInterface[]> = await response.json();

          if (response.ok) {
            this.invoices = data.data || [];
            return true; // success
          } else {
            this.error = data.message || "Failed to fetch invoice.";
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
        this.selectedInvoice = null;

        try {
          const response = await fetch(`${apiUrl}/invoice/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data: CommonResponseInterface<InvoiceInterface> = await response.json();

          if (response.ok) {
            this.selectedInvoice = data.data;
            return true;
          } else {
            this.error = data.message || "Failed to fetch invoice detail.";
            return false;
          }
        } catch (err) {
          this.error = (err as Error).message;
          return false;
        } finally {
          this.loading = false;
        }
      },
      async deleteInvoice(id: number, token: string): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(`${apiUrl}/invoice/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok) {
            this.invoices = this.invoices.filter(inv => inv.id !== id);
            return true;
          } else {
            this.error = data.message || "Failed to delete invoice.";
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
