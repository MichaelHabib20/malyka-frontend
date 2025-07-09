<template>
  <div class="card-body container">
    <div v-if="selectedRows.length" class="mb-3 d-flex align-items-center gap-2 modern-toolbar">
      <button
        class="btn btn-outline-secondary d-flex align-items-center gap-1"
        @click="handleExport"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-download"></i>
        Export
      </button>
      <button
        class="btn btn-success d-flex align-items-center gap-1"
        @click="handleBulkApprove"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-check"></i>
        Approve Selected
      </button>
      <button
        class="btn btn-warning d-flex align-items-center gap-1"
        @click="handleBulkReject"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-times"></i>
        Reject Selected
      </button>
      <button
        class="btn btn-danger d-flex align-items-center gap-1"
        :disabled="!selectedRows.length"
        @click="handleBulkDelete"
      >
        <i class="fa fa-trash"></i>
        Delete Selected
      </button>
      <span v-if="selectedRows.length" class="selected-count-badge">
        {{ selectedRows.length }} selected
      </span>
    </div>
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="'Search by name, code'"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :selected-rows="selectedRows"
      :show-selection="true"
      @update:sort-by="handleSortBy"
      @update:sort-direction="handleSortDirection"
      @update:search-query="handleSearch"
      @button-click="handleButtonClick"
      @action="handleAction"
      @update:selectedRows="val => selectedRows = val"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { CustomButton } from '../interfaces/customButtons';
import type { RegisterKid } from '../interfaces/registerKid';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();

// Reactive data
const registerKids = ref<RegisterKid[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');
const selectedRows = ref<any[]>([]);

// Define columns for register kids table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'kid.code',
      label: 'Code',
      type: 'code',
      sortable: true,
      width: '80px'
    },
    {
      key: 'kid.name',
      label: 'Name',
      type: 'text',
      align: 'right',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'kid.grade.name',
      label: 'Grade',
      type: 'grade-chip',
      align: 'center',
      sortable: false
    },
    {
      key: 'kid.class.name',
      label: 'Class',
      type: 'text',
      align: 'center',
      sortable: true
    },
    {
      key: 'kid.registrationDate',
      label: 'Registration Date',
      type: 'date',
      dateFormat: 'short',
      align: 'center',
      sortable: false
    },
    {
      key: 'kid.whatsapp',
      label: 'Contact',
      type: 'phone-chip',
      align: 'center',
      sortable: false
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View register kids') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-eye', label: 'View', color: '#10b981' },
        { icon: 'fa-regular fa-edit', label: 'Edit', color: '#3b82f6' },
        { icon: 'fa-solid fa-trash', label: 'Delete', color: '#dc3545' }
      ],
      align: 'center',
      width: '120px'
    });
  }
  
  return baseColumns;
});

// Custom buttons
const customButtons = computed(() => {
  return createButtonsWithPermissions([
    // {
    //   id: 'new-registration',
    //   permission: 'View register kids',
    //   config: {
    //     label: 'New Registration',
    //     icon: 'fa-plus',
    //     variant: 'btn-primary'
    //   }
    // }
  ]);
});

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = registerKids.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((registration) => {
      return (
        registration.kid.name.toLowerCase().includes(query) ||
        registration.kid.code.toLowerCase().includes(query) ||
        (registration.kid.whatsapp && registration.kid.whatsapp.includes(query))
      );
    });
  }
  
  // Apply sorting
  if (sortBy.value) {
    data = [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Handle nested properties
      if (sortBy.value.includes('.')) {
        const keys = sortBy.value.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a as any);
        bValue = keys.reduce((obj, key) => obj?.[key], b as any);
      } else {
        aValue = a[sortBy.value as keyof typeof a];
        bValue = b[sortBy.value as keyof typeof b];
      }
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection.value === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }
  
  return data;
});

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleButtonClick = ({ buttonId, button }: { buttonId: string; button: CustomButton }) => {
  if (buttonId === 'new-registration') {
    router.push('/register-kids/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === 'View') {
    router.push(`/students/view/${row.kid.id}`);
  } else if (action === 'Edit') {
    router.push(`/students/edit/${row.kid.id}`);
  } else if (action === 'Delete') {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        `Are you sure you want to delete registration for "${row.kid.name}"? This action cannot be undone.`,
        'Confirm Delete',
        {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning',
          confirmButtonClass: 'btn-danger',
          cancelButtonClass: 'btn-secondary'
        }
      );
      
      // User confirmed, proceed with deletion
      const result = await dataService.createOnline(`/api/KidsRegistration/DeleteRegistration/${row.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.statusCode === 200)) {
        dataService.createAlertMessage('Registration deleted successfully', 'success');
        // Refresh the registrations list
        await fetchRegisterKids();
      } else {
        throw new Error(result?.message || 'Failed to delete registration');
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : 'Failed to delete registration', 
          'error'
        );
      }
    }
  }
};

const handleSortBy = (column: string) => {
  sortBy.value = column;
};

const handleSortDirection = (direction: 'asc' | 'desc') => {
  sortDirection.value = direction;
};

const handleBulkDelete = async () => {
  if (!selectedRows.value.length) return;
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedRows.value.length} selected registrations? This action cannot be undone.`,
      'Confirm Bulk Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'btn-danger',
        cancelButtonClass: 'btn-secondary'
      }
    );
    
    // Delete each selected registration
    const deletePromises = selectedRows.value.map(row => 
      dataService.createOnline(`/api/KidsRegistration/DeleteRegistration/${row.id}`, {})
    );
    
    await Promise.all(deletePromises);
    selectedRows.value = [];
    await fetchRegisterKids();
    dataService.createAlertMessage('Selected registrations deleted successfully', 'success');
  } catch (error) {
    if (error !== 'cancel') {
      dataService.createAlertMessage('Failed to delete selected registrations', 'error');
    }
  }
};

const handleBulkApprove = async () => {
  if (!selectedRows.value.length) return;
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve ${selectedRows.value.length} selected registrations?`,
      'Confirm Bulk Approve',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'info',
        confirmButtonClass: 'btn-success',
        cancelButtonClass: 'btn-secondary'
      }
    );
    
    // Approve each selected registration
    const approvePromises = selectedRows.value.map(row => 
      dataService.createOnline(`/api/KidsRegistration/ApproveRegistration/${row.id}`, {})
    );
    
    await Promise.all(approvePromises);
    selectedRows.value = [];
    await fetchRegisterKids();
    dataService.createAlertMessage('Selected registrations approved successfully', 'success');
  } catch (error) {
    if (error !== 'cancel') {
      dataService.createAlertMessage('Failed to approve selected registrations', 'error');
    }
  }
};

const handleBulkReject = async () => {
  if (!selectedRows.value.length) return;
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to reject ${selectedRows.value.length} selected registrations?`,
      'Confirm Bulk Reject',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'btn-warning',
        cancelButtonClass: 'btn-secondary'
      }
    );
    
    // Reject each selected registration
    const rejectPromises = selectedRows.value.map(row => 
      dataService.createOnline(`/api/KidsRegistration/RejectRegistration/${row.id}`, {})
    );
    
    await Promise.all(rejectPromises);
    selectedRows.value = [];
    await fetchRegisterKids();
    dataService.createAlertMessage('Selected registrations rejected successfully', 'success');
  } catch (error) {
    if (error !== 'cancel') {
      dataService.createAlertMessage('Failed to reject selected registrations', 'error');
    }
  }
};

const handleExport = () => {
  // Export logic here (CSV, Excel, etc.)
  dataService.createAlertMessage('Export feature coming soon!', 'info');
};

// Fetch register kids data
const fetchRegisterKids = async () => {
  loading.value = true;
  try {
    const result: any = await dataService.fetchOnline('/api/KidsRegistration/GetRegisterKids');
    
    if (result && (result.httpStatus === 200 || result.statusCode === 200)) {
      registerKids.value = result.data.kids || [];
    } else {
      registerKids.value = [];
    }
  } catch (error) {
    registerKids.value = [];
    dataService.createAlertMessage('Failed to fetch registrations', 'error');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchRegisterKids();
});
</script>

<style scoped>
.card-body {
  max-width: 1200px;
}

.modern-toolbar {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.btn {
  border-radius: 8px !important;
  font-weight: 500;
  transition: box-shadow 0.2s;
}

.btn i {
  font-size: 1rem;
}

.selected-count-badge {
  background: #e0e7ef;
  color: #2563eb;
  border-radius: 16px;
  padding: 0.25em 0.75em;
  font-weight: 600;
  margin-left: 1rem;
  font-size: 1rem;
  letter-spacing: 0.5px;
}
</style>
