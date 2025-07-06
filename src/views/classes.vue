<template>
  <div class="card-body pt-4"
  >
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
import type { Class } from '../interfaces/class';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();

// Reactive data
const classes = ref<Class[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');
const gradeId  = ref(route.params.gradeId as string);

// Define columns for classes table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'class.name',
      label: 'Name',
      type: 'text',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'class.grade.name',
      label: 'Grade',
      type: 'text',
      sortable: true,
      isMainColumn: false
    },
    {
      key: 'kidsCount',
      label: 'No. of Kids',
      type: 'number',
      sortable: true,
      isMainColumn: false
    },
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View classes') || authService.hasRole(1)) {
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
      id: 'new-class',
      permission: 'View classes',
      config: {
        label: 'New Class',
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    }
  ]);
});

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = classes.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((classItem: any) => {
      return (
        classItem.class.name.toLowerCase().includes(query) ||
        (classItem.class.grade.name && classItem.class.grade.name.toLowerCase().includes(query))
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
  if (buttonId === 'new-class') {
    router.push('/grade-levels/classes/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === 'Edit') {
    router.push(`/grade-levels/classes/edit/${row.class.id}`);
  } else if (action === 'Delete') {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        `Are you sure you want to delete class "${row.class.name}"? This action cannot be undone.`,
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
      const result = await dataService.createOnline(`/api/Grades/DeleteClass/${row.class.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.httpStatus === 204)) {
        dataService.createAlertMessage('Class deleted successfully', 'success');
        // Refresh the classes list
        await fetchClasses();
      } else {
        throw new Error(result?.message || 'Failed to delete class');
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : 'Failed to delete class', 
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

// Fetch classes data
const fetchClasses = async () => {
  loading.value = true;
  try {
    const result: any = await dataService.fetchOnline('/api/Grades/GetClasses');
    
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      classes.value = result.data || [];
    } else {
      classes.value = [];
    }
  } catch (error) {
    classes.value = [];
    dataService.createAlertMessage('Failed to fetch classes', 'error');
  } finally {
    loading.value = false;
  }
};

const fetchClassesByGradeId = async (gradeId: string) => {
  loading.value = true;
  try {
    const result: any = await dataService.fetchOnline(`/api/Grades/GetClassByGradeId/${gradeId}`);
    if (result && (result.httpStatus === 200 || result.Status === 200)) {
      classes.value = result.data || [];
    } else {
      classes.value = [];
    }
  } catch (error) {
    classes.value = [];
    dataService.createAlertMessage('Failed to fetch classes', 'error');
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  if(gradeId.value){
    fetchClassesByGradeId(gradeId.value);
  }else{
    fetchClasses();
  }
});
</script>

<style scoped>

</style>