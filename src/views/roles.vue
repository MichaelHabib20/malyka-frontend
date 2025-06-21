<template>

    <div class="card-body p-4">
      <DataTable
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :search-query="searchQuery"
        :search-placeholder="'Search roles...'"
        :custom-buttons="customButtons"
        @update:search-query="handleSearch"
        @button-click="handleButtonClick"
        @action="handleAction"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { CustomButton } from '../interfaces/customButtons';
import { dataService } from '../services/dataContext';
import { useRouter } from 'vue-router';
import type { Role } from '../interfaces/roles';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { ElMessageBox } from 'element-plus';
const router = useRouter();

// Reactive data
const roles = ref<Role[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// Define columns for roles table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'name',
      label: 'Role Name',
      type: 'text',
      isMainColumn: true
    }
  ];
  
  // Only add actions column if user has permission to edit roles
  if (authService.hasPermission('View roles') || authService.hasPermission('View roles') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-edit', label: 'Edit', color: '#3b82f6' },
        { icon: 'fa-solid fa-trash', label: 'Delete', color: '#ef4444' }
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
    {
      id: 'new-role',
      permission: 'Add roles',
      config: {
        label: 'New Role',
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    }
  ]);
});

// Computed property to filter data based on search
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return roles.value;
  }

  const query = searchQuery.value.toLowerCase();
  return roles.value.filter((role) => {
    return (
      role.name.toLowerCase().includes(query) 
    );
  });
});

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleButtonClick = ({ buttonId, button }: { buttonId: string; button: CustomButton }) => {
  if (buttonId === 'new-role') {
    router.push('/adminstrations/roles/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === 'Edit') {
    router.push(`/adminstrations/roles/edit/${row.id}`);
  } else if (action === 'Delete') {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        `Are you sure you want to delete role "${row.name}"? This action cannot be undone.`,
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
      await deleteRole(row.id);
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : 'Failed to delete role', 
          'error'
        );
      }
    }
  }
};

// Delete role function
const deleteRole = async (roleId: number) => {
  loading.value = true;
  try {
    const result : any = await dataService.createOnline(`/api/Admin/DeleteRole/${roleId}`, {});
    
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      // Remove the role from the local array
      roles.value = roles.value.filter(role => role.id !== roleId);
      dataService.createAlertMessage('Role deleted successfully', 'success');
    } else {
      throw new Error(result?.message || 'Failed to delete role');
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    dataService.createAlertMessage(
      error instanceof Error ? error.message : 'An error occurred while deleting the role.', 
      'error'
    );
  } finally {
    loading.value = false;
  }
};

// Fetch roles data
const fetchRoles = async () => {
  loading.value = true;
  try {
    const result : any = await dataService.fetchOnline('/api/Admin/GetRolesList');
    
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      roles.value = result.data.roles || [];
    } else {
      roles.value = [];
    }
  } catch (error) {
    roles.value = [];
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchRoles();
});
</script>

<style scoped>

.card-body{
    background-color: white;
    padding: 2 rem !important;
}


</style>