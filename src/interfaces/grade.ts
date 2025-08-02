export interface Grade {
  id: number;
  name: string;
  arName?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  grade?: {
    id: number;
    name: string;
    arName?: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
} 