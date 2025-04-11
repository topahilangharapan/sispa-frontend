import { defineStore } from "pinia";
import type { InvoiceInterface, InvoiceRequestResponseInterface } from '../interfaces/invoice.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    loading: false,
    error: null as null | string,
    invoices: [] as InvoiceInterface[],
    selectedInvoice: null as InvoiceInterface | null,
    pdfBase64: null as string | null,
    pdfFileName: null as string | null,
  }),
  actions: {

    async create(body: InvoiceInterface, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + "/invoice/create", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data: CommonResponseInterface<InvoiceRequestResponseInterface> =
          await response.json();

        if (response.ok) {

          window.$toast("success", "Invoice berhasil dibuat!");
          return true;
        } else {
          window.$toast("error", "Gagal membuat Invoice: " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", "Gagal membuat Invoice: " + this.error);
        return false;
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
          this.invoices = this.invoices.filter((inv: InvoiceInterface) => inv.id !== id);
          window.$toast("success", "Invoice berhasil dihapus!");
          return true;
        } else {
          this.error = data.message || "Gagal menghapus invoice.";
          window.$toast("error", this.error ? this.error : "Terjadi kesalahan yang tidak diketahui.");

          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", `Gagal menghapus invoice: ${this.error}`);
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
        const invoiceResponse = await fetch(`${apiUrl}/invoice/${id}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        });

        const invoiceData: CommonResponseInterface<InvoiceInterface> = await invoiceResponse.json();
        if (!invoiceResponse.ok) {
          this.error = invoiceData.message || "Failed to fetch invoice.";
          return false;
        }

        this.selectedInvoice = invoiceData.data;
        return true;
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },
    async downloadInvoice(id: number, token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/invoice/${id}/download`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download invoice: ${response.statusText}`);
        }

        // Get the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        // Extract filename from Content-Disposition header
        let filename;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
          if (filenameMatch && filenameMatch[1]) {
            // Remove quotes if present
            filename = filenameMatch[1].replace(/"/g, '').replace(/'/g, '');
          } else {
            // If we couldn't extract the filename, use the invoice ID
            filename = `invoice_${id}.pdf`;
          }
        } else {
          // If there's no Content-Disposition header, use the invoice ID
          filename = `invoice_${id}.pdf`;
        }

        // Get the blob from the response
        const blob = await response.blob();

        // Create a URL for the blob and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.$toast("success", "Invoice berhasil diunduh!");
        return true;
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast("error", `Gagal mengunduh invoice: ${this.error}`);
        return false;
      } finally {
        this.loading = false;
      }
    }
    }

})
