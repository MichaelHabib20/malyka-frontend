<template>

    <div class="card-body pt-4">
      <DataTable
        :columns="columns"
        :data="filteredData"
        :loading="loading"
        :search-query="searchQuery"
        :search-placeholder="$t('roles.searchPlaceholder')"
        :custom-buttons="customButtons"
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
import { useRouter } from 'vue-router';
import type { Role } from '../interfaces/roles';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { ElMessageBox } from 'element-plus';
const router = useRouter();

const { t } = useI18n();

// Reactive data
const roles = ref<Role[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// Define columns for roles table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'name',
      label: t('roles.columns.name'),
      type: 'text',
      isMainColumn: true
    }
  ];
  
  // Only add actions column if user has permission to edit roles
  if (authService.hasPermission('View roles') || authService.hasPermission('View roles') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: t('app.actions'),
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-edit', label: t('common.edit'), color: '#3b82f6' },
        { icon: 'fa-solid fa-trash', label: t('common.delete'), color: '#ef4444' }
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
        label: t('roles.buttons.newRole'),
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
  console.log(button)
  if (buttonId === 'new-role') {
    router.push('/adminstrations/roles/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === t('common.edit')) {
    router.push(`/adminstrations/roles/edit/${row.id}`);
  } else if (action === t('common.delete')) {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        t('roles.deleteConfirmation', { name: row.name }),
        t('common.confirmDelete'),
        {
          confirmButtonText: t('common.delete'),
          cancelButtonText: t('common.cancel'),
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
          error instanceof Error ? error.message : t('roles.deleteError'), 
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
      dataService.createAlertMessage(t('roles.deleteSuccess'), 'success');
    } else {
      throw new Error(result?.message || t('roles.deleteError'));
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    dataService.createAlertMessage(
      error instanceof Error ? error.message : t('roles.deleteError'), 
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
    dataService.createAlertMessage(t('roles.fetchError'), 'error');
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


</style>