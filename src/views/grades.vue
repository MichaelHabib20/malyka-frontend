<template>
  <div class="card-body pt-4">
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="'Search by name'"
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
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { CustomButton } from '../interfaces/customButtons';
import type { Grade } from '../interfaces/grade';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();

// Reactive data
const grades = ref<Grade[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');

// Define columns for grades table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      isMainColumn: true
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View grades') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      actions: [
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
    {
      id: 'new-grade',
      permission: 'View grades',
      config: {
        label: 'New Grade',
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    }
  ]);
});

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = grades.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((grade) => {
      return (
        grade.name.toLowerCase().includes(query) ||
        (grade.description && grade.description.toLowerCase().includes(query))
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
  if (buttonId === 'new-grade') {
    router.push('/grade-levels/grades/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === 'Edit') {
    router.push(`/grade-levels/grades/edit/${row.id}`);
  } else if (action === 'Delete') {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        `Are you sure you want to delete grade "${row.name}"? This action cannot be undone.`,
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
      const result = await dataService.createOnline(`/api/Grades/DeleteGrade/${row.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.httpStatus === 204)) {
        dataService.createAlertMessage('Grade deleted successfully', 'success');
        // Refresh the grades list
        await fetchGrades();
      } else {
        throw new Error(result?.message || 'Failed to delete grade');
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : 'Failed to delete grade', 
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

// Fetch grades data
const fetchGrades = async () => {
  loading.value = true;
  try {
    const result: any = await dataService.fetchOnline('/api/Grades/GetGrades');
    
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      grades.value = result.data || [];
    } else {
      grades.value = [];
    }
  } catch (error) {
    grades.value = [];
    dataService.createAlertMessage('Failed to fetch grades', 'error');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchGrades();
});
</script>

<style scoped>

</style>