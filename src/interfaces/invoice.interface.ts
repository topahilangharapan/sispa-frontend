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
  noInvoice: string
}

export interface InvoiceRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}


