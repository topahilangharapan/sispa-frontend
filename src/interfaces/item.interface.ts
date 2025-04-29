export interface CreateItemRequestInterface {
  title: string;
  unit: string;
  pricePerUnit: number;
  description: string;
  category: string;
}

export interface CreateItemResponseInterface {
  title: string;
  unit: string;
  pricePerUnit: number;
  description: string;
  category: string;
}

export interface ItemCategoryInterface {
  id: number;
  name: string;
}

export interface ItemStatusInterface {
  id: number;
  name: string;
}

export interface UpdateItemStatusRequestDTO {
  id: number;
  idItemStatus: number;
}

export interface ItemInterface {
  id: number;
  title: string;
  unit: string;
  pricePerUnit: number;
  description: string;
  category: string;
  status: string;
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  updatedBy: string
}


