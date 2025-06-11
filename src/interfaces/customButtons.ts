// Define interface for custom buttons
export interface CustomButton {
    id: string;
    label: string;
    icon: string;
    variant?: 'btn-primary' | 'btn-secondary' | 'btn-success' | 'btn-danger' | 'btn-warning' | 'btn-info';
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
  }