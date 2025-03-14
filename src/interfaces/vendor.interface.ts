export interface VendorInterface {
  id: string,
  name: string,
  contact: string,
  email: string,
  address: string,
  service: string,
  description: string,
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string
}

export interface VendorRequestInterface {
  name: string,
  contact: string,
  email: string,
  address: string,
  service: string,
  description: string,
}
