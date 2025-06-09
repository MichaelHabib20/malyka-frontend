import type { Column } from "./column";

export interface Props {
  columns: Column[];
  data: any[];
  loading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  searchQuery?: string;
  searchPlaceholder?: string;
}