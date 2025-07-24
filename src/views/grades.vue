<template>
  <div class="card-body pt-4">
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="$t('grades.searchPlaceholder')"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      @update:sort-by="handleSortBy"
      @update:sort-direction="handleSortDirection"
      @update:search-query="handleSearch"
      @button-click="handleButtonClick"
      @action="handleAction"
      @number-click="handleNumberClick"
      @cell-edit="handleCellEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { Grade } from '../interfaces/grade';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const { t } = useI18n();

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
      key: 'grade.name',
      label: t('grades.columns.name'),
      type: 'editable',
      editableType: 'text',
      editablePlaceholder: 'Enter grade name',
      editableValidation: (value: string) => {
        if (!value) return 'Grade name is required';
        return null;
      },
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'classesCount',
      label: t('grades.columns.classesCount'),
      type: 'clickable-number',
      sortable: true,
      isMainColumn: false,
      nestedStructureForClickableNumber: 'grade.id',
      routeConfig: {
        path: '/grade-levels/classes/:gradeId',
        params: (row: any, _value: any) => ({ gradeId: row.grade.id })
      }
    },
    {
      key: 'kidsCount',
      label: t('grades.columns.kidsCount'),
      type: 'number',
      sortable: true,
      isMainColumn: false
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View grades') || authService.hasRole(1)) {
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

// Custom buttons
const customButtons = computed(() => {
  return createButtonsWithPermissions([
    {
      id: 'new-grade',
      permission: 'View grades',
      config: {
        label: t('grades.buttons.newGrade'),
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
    data = data.filter((grade: any) => {
      return (
        (grade.grade && grade.grade.name && grade.grade.name.toLowerCase().includes(query)) ||
        (grade.description && grade.description.toLowerCase().includes(query))
      );
    });
  }
  
  // Apply sorting
  if (sortBy.value) {
    data = [...data].sort((a, b) => {
      // Helper function to get nested value
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => {
          return current && current[key] !== undefined ? current[key] : null;
        }, obj);
      };
      
      const aValue = getNestedValue(a, sortBy.value);
      const bValue = getNestedValue(b, sortBy.value);
      
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

const handleButtonClick = ({ buttonId }: { buttonId: string }) => {
  if (buttonId === 'new-grade') {
    router.push('/grade-levels/grades/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === t('common.edit')) {
    router.push(`/grade-levels/grades/edit/${row.grade.id}`);
  } else if (action === t('common.delete')) {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        t('grades.deleteConfirmation', { name: row.grade.name }),
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
      const result = await dataService.createOnline(`/api/Grades/DeleteGrade/${row.grade.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.httpStatus === 204)) {
        dataService.createAlertMessage(t('grades.deleteSuccess'), 'success');
        // Refresh the grades list
        await fetchGrades();
      } else {
        throw new Error(result?.message || t('grades.deleteError'));
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : t('grades.deleteError'), 
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
const handleNumberClick = ({ column, value, row }: { column: string; value: any; row: any }) => {
  // This handler is called when a clickable number is clicked
  // The automatic routing is already handled by the DataTable component
  console.log('Number clicked:', { column, value, row });
  // You can add additional logic here if needed
};

const handleCellEdit = ({ column, value, row, originalValue }: { column: string; value: any; row: any; originalValue: any }) => {
  console.log('Cell edited:', { column, value, row, originalValue });
  // updateGrade(row);
  if(value !== originalValue){
    const modal : Grade = {
      id: row.grade.id,
      name: value
    }
    updateGrade(modal);
  }
};
const updateGrade = async (grade: Grade) => {
  const result: any = await dataService.createOnline(`/api/Grades/UpdateGrade`, grade);
  if (result && (result.httpStatus === 200 || result.statusCode === 200)) {
    dataService.createAlertMessage(t('grades.updateSuccess'), 'success');
    await fetchGrades();
  }
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
    dataService.createAlertMessage(t('grades.fetchError'), 'error');
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