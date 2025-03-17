export interface ClientInterface {
    id: string,
    name: string,
    contact: string,
    email: string,
    address: string,
    industry: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
    createdBy: string,
    updatedBy: string
  }
  
  export interface ClientRequestInterface {
    name: string,
    contact: string,
    email: string,
    address: string,
    industry: string,
    description: string,
  }
  