export interface FinalReportInterface {
  id: number;
  event: string;
  eventDate: string;
  company: string;
}

export interface CreateFinalReportRequestInterface {
  event: string;
  tanggal: string;
  perusahaan: string;
}

export interface CreateFinalReportResponseInterface {
  pdf: Blob;
  fileName: string;
}


