<template>

    <div class="card-body pt-4">
      <DataTable
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :search-query="searchQuery"
        :search-placeholder="$t('admins.searchPlaceholder')"
        :custom-buttons="customButtons"
        :sort-by="sortBy"
        :sort-direction="sortDirection"
        @update:sort-by="handleSortBy"
        @update:sort-direction="handleSortDirection"
        @update:search-query="handleSearch"
        @button-click="handleButtonClick"
        @action="handleAction"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { CustomButton } from '../interfaces/customButtons';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter } from 'vue-router';
import type { Admin } from '../interfaces/admin';
import { ElMessageBox } from 'element-plus';
const router = useRouter();

const { t } = useI18n();

// Types

// Reactive data
const admins = ref<Admin[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');

// Transform admins data to include combined name
const transformedAdmins = computed(() => {
  return admins.value.map(admin => ({
    ...admin,
    name: `${admin.firstName} ${admin.lastName}`
  }));
});

// Define columns for admins table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'name',
      label: t('admins.columns.name'),
      type: 'text',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'email',
      label: t('admins.columns.email'),
      type: 'text'
    },
    {
      key: 'phoneNumber',
      label: t('admins.columns.phoneNumber'),
      type: 'text'
    },
    {
      key: 'roleName',
      label: t('admins.columns.role'),
      type: 'text',
      isMainColumn: true
    }
  ];
  
  // Only add actions column if user has permission to edit admins
  if (authService.hasPermission('View admins') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: t('app.actions'),
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-edit', label: t('common.edit'), color: '#3b82f6' },
        { icon: 'fa-solid fa-trash', label: t('common.delete'), color: '#dc3545' }
      ],
      align: 'center',
      width: '120px'
    });
  }
  
  return baseColumns;
});

// Custom buttons - Simple approach using utility function
const customButtons = computed(() => {
  return createButtonsWithPermissions([
    {
      id: 'new-admin',
      permission: 'View admins',
      config: {
        label: t('admins.buttons.newAdmin'),
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    },
  ]);
});

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = transformedAdmins.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((admin) => {
      return (
        admin.firstName.toLowerCase().includes(query) ||
        admin.lastName.toLowerCase().includes(query) ||
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.phoneNumber.toLowerCase().includes(query)

      );
    });
  }
  
  // Apply sorting
  if (sortBy.value) {
    data = [...data].sort((a, b) => {
      const aValue = a[sortBy.value as keyof typeof a];
      const bValue = b[sortBy.value as keyof typeof b];
      
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
  if (buttonId === 'new-admin') {
    router.push('/adminstrations/admins/create');
    // TODO: Implement new role creation logic
    // This could open a modal or navigate to a create role page
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  
  if (action === t('common.edit')) {
    router.push(`/adminstrations/admins/edit/${row.id}`);
  } else if (action === t('common.delete')) {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        t('admins.deleteConfirmation', { name: row.name }),
        t('admins.confirmDelete'),
        {
          confirmButtonText: t('common.delete'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
          confirmButtonClass: 'btn-danger',
          cancelButtonClass: 'btn-secondary'
        }
      );
      
      // User confirmed, proceed with deletion
      const result = await dataService.createOnline(`/api/Admin/DeleteUser/${row.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.httpStatus === 204)) {
        dataService.createAlertMessage(t('admins.deleteSuccess'), 'success');
        // Refresh the admins list
        await fetchAdmins();
      } else {
        throw new Error(result?.message || t('admins.deleteError'));
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : t('admins.deleteError'), 
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

// Fetch admins data
const fetchAdmins = async () => {
  loading.value = true;
  try {
    const result : any = await dataService.fetchOnline('/api/Admin/GetAdmins');
    
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      admins.value = result.data.contacts || [];
    } else {
        admins.value = [];
    }
  } catch (error) {
    admins.value = [];
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
    fetchAdmins();
});
</script>

<style scoped>

.card-body{
    /* background-color: white; */
    padding: 2 rem !important;
}


</style>