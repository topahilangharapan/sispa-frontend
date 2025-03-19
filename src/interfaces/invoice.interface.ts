export interface InvoiceInterface {
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
  event: string
}

export interface InvoiceRequestResponseInterface {
  pdf: Blob;
  fileName: string;
}


