# Simple Permission-Based Button Filtering

## Approach 1: Direct Auth Service Check (Simplest)

```typescript
// Custom buttons
const customButtons = computed(() => {
  const buttons: CustomButton[] = [];
  
  // Only add button if user has permission
  if (authService.hasPermission('Add admins')) {
    buttons.push({
      id: 'new-admin',
      label: 'New Admin',
      icon: 'fa-plus',
      variant: 'btn-primary'
    });
  }
  
  return buttons;
});
```

## Approach 2: Using Utility Function (Cleaner)

```typescript
import { createButtonsWithPermissions } from '../utils/simplePermissions';

// Custom buttons
const customButtons = computed(() => {
  return createButtonsWithPermissions([
    {
      id: 'new-admin',
      permission: 'Add admins',
      config: {
        label: 'New Admin',
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    }
  ]);
});
```

## For Table Actions

```typescript
// Define columns with permission-based actions
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'name',
      label: 'Role Name',
      type: 'text'
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('Update admins')) {
    baseColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-edit', label: 'Edit', color: '#3b82f6' },
      ],
      align: 'center',
      width: '120px'
    });
  }
  
  return baseColumns;
});
```

## Multiple Buttons Example

```typescript
const customButtons = computed(() => {
  const buttons: CustomButton[] = [];
  
  if (authService.hasPermission('Add admins')) {
    buttons.push({
      id: 'new-admin',
      label: 'New Admin',
      icon: 'fa-plus',
      variant: 'btn-primary'
    });
  }
  
  if (authService.hasPermission('Export data')) {
    buttons.push({
      id: 'export',
      label: 'Export',
      icon: 'fa-download',
      variant: 'btn-secondary'
    });
  }
  
  return buttons;
});
```

## That's It!

- **Simple**: Just use `authService.hasPermission('permission_name')`
- **Reactive**: Uses Vue computed properties, so UI updates automatically
- **Type Safe**: Full TypeScript support
- **No Complex Setup**: Works with your existing auth service 