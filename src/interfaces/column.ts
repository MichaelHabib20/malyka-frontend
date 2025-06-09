export interface Column {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    type: 'text' | 'number' | 'date' | 'icon' | 'checkbox' | 'select' | 'image' | 'actions';
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: { label: string; value: any }[];
    width?: string;
    icon?: string;
    iconColor?: string;
    selectOptions?: { label: string; value: any }[];
    actions?: { icon: string; label: string; color?: string }[];
  }