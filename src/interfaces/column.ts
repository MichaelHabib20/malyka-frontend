export interface Column {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    type: 'text' | 'number' | 'date' | 'icon' | 'checkbox' | 'select' | 'image' | 'actions' | 'link'| 'attendance-status' | 'code'| 'percentage' | 'clickable-number' | 'grade-chip' | 'phone-chip' | 'editable';
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: { label: string; value: any }[];
    width?: string;
    icon?: string;
    iconColor?: string;
    selectOptions?: { label: string; value: any }[];
    actions?: { icon: string; label: string; color?: string }[];
    isMainColumn?: boolean;
    tooltip?: string;
    nestedStructureForClickableNumber?: string;
    dateFormat?: string;
    routeConfig?: string | {
      path: string;
      params?: (row: any, value: any) => Record<string, any>;
    };
    // Editable column properties
    editableType?: 'text' | 'number' | 'textarea';
    editablePlaceholder?: string;
    editableValidation?: (value: any) => string | null; // Returns error message or null if valid
  }