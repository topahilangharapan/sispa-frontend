export interface PurchaseOrderItemInterface {
  id: string;
  tempId: string;
  title: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  status: string;
}

export interface PurchaseOrderInterface {
  id: number;
  vendorId?: string;
  clientId?: string;
  companyName: string;
  companyAddress: string;
  receiver: string;
  items: PurchaseOrderItemInterface[];
  terms: string;
  placeSigned: string;
  dateCreated: string;
  dateSigned: string;
  signee: string;
  deletedAt: string | null;
  noPo: string;
}

export interface PurchaseOrderRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}

export interface CreatePurchaseOrderInterface {
  id: number;
  vendorId: string;
  clientId: string;
  companyName: string;
  companyAddress: string;
  receiver: string;
  items: PurchaseOrderItemInterface[];
  terms: string;
  placeSigned: string;
  dateCreated: string;
  dateSigned: string;
  signee: string;
}


