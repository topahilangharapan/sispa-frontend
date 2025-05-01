import { defineStore } from "pinia";
import type {
  CreatePurchaseOrderInterface,
  PurchaseOrderInterface,
  PurchaseOrderRequestResponseInterface
} from '../interfaces/purchaseOrder.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const usePurchaseOrderStore = defineStore('purchaseOrder', {
    state: () => ({
      loading: false,
      error: null as null | string,
      purchaseOrders: [] as PurchaseOrderInterface[],
      selectedPurchaseOrders: [] as PurchaseOrderInterface[],
      selectedPurchaseOrder: null as PurchaseOrderInterface | null,
      refreshKey: 0,
    }),
    actions: {
      async create(body: CreatePurchaseOrderInterface, token: string): Promise<boolean> {

        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(apiUrl + '/purchase-order/create',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(body),
            },
          )

          const data: CommonResponseInterface<PurchaseOrderRequestResponseInterface> = await response.json();

          if (response.ok) {
            window.$toast('success', "Purchase Order berhasil dibuat!");
            return true; // Login berhasil
          } else {
            window.$toast('error', "Gagal membuat Purchase Order: " + data.message);
            return false; // Login gagal
          }
        } catch (err) {
          this.error = (err as Error).message;
          window.$toast('error', "Gagal membuat Purchase Order: " + this.error);
          return false; // Login gagal karena error
        } finally {
          this.loading = false;
        }
      },
      async fetchAll(token: string): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(`${apiUrl}/purchase-order/all`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data: CommonResponseInterface<PurchaseOrderInterface[]> = await response.json();

          if (response.ok) {
            this.purchaseOrders = data.data || [];
            return true; // success
          } else {
            this.error = data.message || "Failed to fetch purchase orders.";
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
        this.selectedPurchaseOrder = null;

        try {
          const response = await fetch(`${apiUrl}/purchase-order/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data: CommonResponseInterface<PurchaseOrderInterface> = await response.json();

          if (response.ok) {
            console.log(data.data)
            this.selectedPurchaseOrder = data.data;
            return true;
          } else {
            this.error = data.message || "Failed to fetch purchase order detail.";
            return false;
          }
        } catch (err) {
          this.error = (err as Error).message;
          return false;
        } finally {
          this.loading = false;
        }
      },
      
      
      async deletePurchaseOrder(id: number, token: string): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          const response = await fetch(`${apiUrl}/purchase-order/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok) {
            // Remove the deleted order and increment refreshKey
            this.purchaseOrders = this.purchaseOrders.filter(order => order.id !== id);
            this.refreshKey++; // Trigger re-render in the UI
            return true;
          } else {
            this.error = data.message || "Failed to mark purchase order as deleted.";
            return false;
          }
        } catch (err) {
          this.error = (err as Error).message;
          return false;
        } finally {
          this.loading = false;
        }
      },
      async downloadPurchaseOrder(id: number, token: string): Promise<boolean> {
        this.loading = true;
        this.error = null;

        try {
          // Use the download endpoint to fetch the existing purchase order and generate the PDF
          const response = await fetch(`${apiUrl}/purchase-order/${id}/download`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to download PDF: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.data && data.data.pdf) {
            // Convert base64 to blob
            function base64ToBlob(base64: string, contentType = "application/pdf") {
              const byteCharacters = atob(base64);
              const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
              const byteArray = new Uint8Array(byteNumbers);
              return new Blob([byteArray], { type: contentType });
            }

            const blob = base64ToBlob(data.data.pdf);
            const filename = data.data.fileName || `purchase_order_${id}.pdf`;

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            window.$toast("success", "Purchase Order berhasil diunduh!");
            return true;
          } else {
            throw new Error("PDF data not found in response");
          }
        } catch (err) {
          this.error = (err as Error).message;
          window.$toast("error", `Gagal mengunduh purchase order: ${this.error}`);
          return false;
        } finally {
          this.loading = false;
        }
    },

}
})
