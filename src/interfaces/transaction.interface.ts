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
  account: string,
  category: string,
  isAdmin: boolean;
  isInterest: boolean;
}
