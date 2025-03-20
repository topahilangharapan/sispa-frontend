export interface PurchaseOrderItemInterface {
  id: number;
  tempId: string;
  title: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  sum: number;
}

export interface PurchaseOrderInterface {
  id: number;
  companyName: string;
  companyAddress: string;
  receiver: string;
  items: PurchaseOrderItemInterface[];
  terms: string;
  placeSigned: string;
  dateCreated: string;
  dateSigned: string;
  signee: string;
  noPo: string;
}

export interface PurchaseOrderRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}


