export interface PurchaseOrderItemInterface {
  tempId: string;
  title: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  description: string;
}

export interface PurchaseOrderInterface {
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

export interface PurchaseOrderRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}


