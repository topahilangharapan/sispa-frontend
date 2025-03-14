import { defineStore } from "pinia";
import type { CommonResponseInterface } from "@/interfaces/common.interface";
import type {
  PurchaseOrderInterface,
  PurchaseOrderRequestResponseInterface
} from '../interfaces/purchaseOrder.interface.ts'


const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const usePurchaseOrderStore = defineStore('purchaseOrder', {
    state: () => ({
      loading: false,
      error: null as null | string,
    }),
    actions: {
      async create(body: PurchaseOrderInterface, token: string): Promise<boolean> {
        function base64ToBlob(base64, contentType = "application/pdf") {
          const byteCharacters = atob(base64); // Decode Base64
          const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: contentType });
        }

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
            // data.data is presumably an array of purchase orders
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
            // data.data presumably the single purchase order
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
            // Possibly remove from local array if needed
            this.purchaseOrders = this.purchaseOrders.filter(po => po.id !== id);
            return true;
          } else {
            this.error = data.message || "Failed to delete purchase order.";
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
