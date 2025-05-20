import type { AccountInterface } from './account.interface.ts'
import type { CategoryInterface } from './category.interface.ts'

export interface BalancePerBankInterface {
    bankName: string;
    totalBalance: number;
}
export interface AddTransactionRequestInterface {
  amount: number;
  description: string;
  account: string;
  category: string;
  isAdmin: boolean;
  isInterest: boolean;
}

export interface AddTransactionResponseInterface {
  amount: number;
  description: string;
  account: string;
  category: string;
  isAdmin: boolean;
  isInterest: boolean;
}

export interface TransactionCategoryInterface {
  id: number;
  name: string;
}

export interface TransactionInterface {
  id: string;
  amount: number;
  description: string;
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string,
  account: AccountInterface,
  category: CategoryInterface,
  isAdmin: boolean;
  isInterest: boolean;
}

export interface IdTransactionInterface {
  id: string;
}

export interface CashFlowChartInterface {
  amount: number;
  bank: string;
  quartal: number;
  month: number;
  year: number;
}

export interface CashFlowChartRequestInterface {
  accountNo: string;
}
