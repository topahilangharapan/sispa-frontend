import {defineStore} from "pinia";

import type {
  BalancePerBankInterface, CashFlowChartRequestInterface,
  IdTransactionInterface,
  TransactionInterface
} from '../interfaces/transaction.interface.ts'
import type { CommonResponseInterface } from '../interfaces/common.interface.ts'
import type {
  AddTransactionRequestInterface,
  AddTransactionResponseInterface, CashFlowChartInterface, TransactionCategoryInterface
} from '../interfaces/transaction.interface.ts'

const apiUrl = import.meta.env.VITE_API_LOCAL_URL;

export const useTransactionStore = defineStore ('transaction', {
  state: () => ({
    transactions: [] as TransactionInterface[],
    loading: false,
    error: null as null | string,
    categories: [] as TransactionCategoryInterface[],
    cashFlowCharts: [] as CashFlowChartInterface[],
    currentTransaction: null as TransactionInterface | null,
    balances: [] as BalancePerBankInterface[],
  }),
  actions: {
    async getCategories(token: string) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/transaction/category/all', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        const data: CommonResponseInterface<TransactionCategoryInterface[]> = await response.json()

        this.categories = data.data
      } catch (err) {
        this.error = `Gagal mengambil data Categories: ${err}`
        window.$toast('error', this.error);
      } finally {
        this.loading = false
      }
    },

    async add(body: AddTransactionRequestInterface, type: string, token: string): Promise<boolean> {

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(apiUrl + '/transaction/' + type + '/add',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
          },
        )

        const data: CommonResponseInterface<AddTransactionResponseInterface> = await response.json();

        if (response.ok) {
          window.$toast('success', "Transaction berhasil dicatat!");
          return true;
        } else {
          window.$toast('error', "Gagal mencatat Transaction : " + data.message);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast('error', "Gagal mencatat Transaction: " + this.error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async getTransactionById(token: string, body: IdTransactionInterface): Promise<TransactionInterface> {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${apiUrl}/transaction/detail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })

        const data: CommonResponseInterface<TransactionInterface> = await response.json()
        this.currentTransaction = data.data
        console.log(data.data)
        return data.data
      } catch (err) {
        this.error = `Failed to fetch transaction ${err}`
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchBalances(token: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${apiUrl}/transaction/balance-per-bank`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data: CommonResponseInterface<BalancePerBankInterface[]> = await response.json();

        if (response.ok) {
          this.balances = data.data || [];
          return true;
        } else {
          this.error = data.message || "Failed to fetch balance per bank.";
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    clear() {
      this.balances = [];
      this.error = null;
      this.loading = false;
    },

    async fetchExpensesByAccount(token: string, accountId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${apiUrl}/transaction/expense/by-account/${accountId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: CommonResponseInterface<TransactionInterface[]> = await response.json();
        if (response.ok) {
          this.transactions = data.data || [];
        } else {
          this.error = data.message || "Failed to fetch list of expenses by account ID.";
        }
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.loading = false;
      }
    },

    async fetchIncomesByAccount(token: string, accountId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${apiUrl}/transaction/income/by-account/${accountId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: CommonResponseInterface<TransactionInterface[]> = await response.json();
        if (response.ok) {
          this.transactions = data.data || [];
        } else {
          this.error = data.message || "Failed to fetch list of incomes by account ID.";
        }
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllExpenses(token: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${apiUrl}/transaction/expense/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: CommonResponseInterface<TransactionInterface[]> = await response.json();
        if (response.ok) {
          this.transactions = data.data || [];
        } else {
          this.error = data.message || "Failed to fetch list of expenses.";
        }
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.loading = false;
      }
    },

    async fetchAllIncomes(token: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${apiUrl}/transaction/income/all`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data: CommonResponseInterface<TransactionInterface[]> = await response.json();
        if (response.ok) {
          this.transactions = data.data || [];
        } else {
          this.error = data.message || "Failed to fetch list of incomes.";
        }
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.loading = false;
      }
    },

    async getCashFlowChart(token: string, body: CashFlowChartRequestInterface) {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(apiUrl+ '/transaction/cash-flow/chart-data', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })

        const data: CommonResponseInterface<CashFlowChartInterface[]> = await response.json()

        this.cashFlowCharts = data.data
      } catch (err) {
        this.error = `Gagal mengambil data Cash Flow Charts: ${err}`
        window.$toast('error', this.error);
      } finally {
        this.loading = false
      }
    },
    async deleteTransaction(token: string, body: IdTransactionInterface): Promise<boolean> {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${apiUrl}/transaction/delete`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          this.transactions = this.transactions.filter(t => t.id !== body.id);
          window.$toast('success', `Berhasil menghapus transaksi dengan ID ${body.id}`);
          return true;
        } else {
          const data = await response.json();
          window.$toast('error', `Gagal menghapus transaksi: ${data.message}`);
          return false;
        }
      } catch (err) {
        this.error = (err as Error).message;
        window.$toast('error', `Gagal menghapus transaksi: ${this.error}`);
        return false;
      } finally {
        this.loading = false;
      }
    }
  


    
  }
})
