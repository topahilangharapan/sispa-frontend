export interface InvoiceInterface {
  id: number;
  receiver: string;
  placeSigned: string;
  dateCreated: string;
  dateSigned: string;
  signee: string;
  purchaseOrderId: number,
  datePaid: string,
  ppnPercentage: number,
  bankName: string,
  accountNumber: string,
  onBehalf: string,
  event: string,
  noPo: string,
  noInvoice: string,
  items: InvoiceItemInterface[],
}

export interface InvoiceItemInterface {
  id: number;
  tempId: string;
  title: string;
  volume: number;
  unit: string;
  pricePerUnit: number;
  description: string;
  sum: number;
}

export interface InvoiceRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}


