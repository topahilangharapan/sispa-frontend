export interface FinalReportInterface {
  id: number;
  event: string;
  eventDate: string;
  company: string;
  images: ImageInterface[];
}

export interface ImageInterface {
  id: number;
  fileName: string;
  fileData: string;
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


