<template>
  <div class="card-body pt-4"
  >
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="t('classes.searchPlaceholder')"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      @update:sort-by="handleSortBy"
      @update:sort-direction="handleSortDirection"
      @update:search-query="handleSearch"
      @button-click="handleButtonClick"
      @action="handleAction"
      @cell-edit="handleCellEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

// Reactive data
const classes = ref<Class[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');
const gradeId  = ref(route.params.gradeId as string);

// Define columns for classes table
const columns = computed(() => {
  const baseColumns: Column[] = !gradeId.value ? [
    {
      key: 'class.name',
      label: t('classes.columns.name'),
      type: 'editable',
      editableType: 'text',
      editablePlaceholder: 'Enter class name',
      editableValidation: (value: string) => {
        if (!value) return 'Class name is required';
        return null;
      },
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'class.grade.name',
      label: t('classes.columns.grade'),
      type: 'text',
      sortable: true,
      isMainColumn: false
    },
    {
      key: 'kidsCount',
      label: t('classes.columns.kidsCount'),
      type: 'number',
      sortable: false,
      align: 'center',
      isMainColumn: false
    },
  ] : [
    {
      key: 'name',
      label: t('classes.columns.name'),
      type: 'text',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'grade.name',
      label: t('classes.columns.grade'),
      type: 'text',
      sortable: true,
      isMainColumn: false
    },
    {
      key: 'kidsCount',
      label: t('classes.columns.kidsCount'),
      type: 'number',
      align: 'center',
      sortable: false,
      isMainColumn: false
    },
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View classes') || authService.hasRole(1)) {
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
      id: 'new-class',
      permission: 'View classes',
      config: {
        label: t('classes.buttons.newClass'),
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
  if (action === t('common.edit')) {
    router.push(`/grade-levels/classes/edit/${row.class.id}`);
  } else if (action === t('common.delete')) {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        t('classes.deleteConfirmation', { name: row.class.name }),
        t('classes.confirmDelete'),
        {
          confirmButtonText: t('common.delete'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
          confirmButtonClass: 'btn-danger',
          cancelButtonClass: 'btn-secondary'
        }
      );
      
      // User confirmed, proceed with deletion
      const result = await dataService.createOnline(`/api/Grades/DeleteClass/${row.class.id}`, {});
      
      if (result && (result.httpStatus === 200 || result.httpStatus === 204)) {
        dataService.createAlertMessage(t('classes.deleteSuccess'), 'success');
        // Refresh the classes list
        await fetchClasses();
      } else {
        throw new Error(result?.message || t('classes.deleteError'));
      }
    } catch (error) {
      if (error !== 'cancel') {
        // Only show error if it's not a cancellation
        dataService.createAlertMessage(
          error instanceof Error ? error.message : t('classes.deleteError'), 
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
    dataService.createAlertMessage(t('classes.errors.fetchFailed'), 'error');
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
    dataService.createAlertMessage(t('classes.errors.fetchFailed'), 'error');
  } finally {
    loading.value = false;
  }
}
const handleCellEdit = async ({ column, value, row, originalValue }: { column: string; value: any; row: any; originalValue: any }) => {
  console.log('Cell edited:', { column, value, row, originalValue });
  if(value !== originalValue){
    const modal : Class = {
      ClassId: row.class.id,
      name: value,
      gradeId: row.class.gradeId
    }
    await updateClass(modal);
  }
};

const updateClass = async (classData: Class) => {
  const result: any = await dataService.createOnline(`/api/Grades/UpdateClass`, classData);
  if (result && (result.httpStatus === 200 || result.statusCode === 200)) {
    dataService.createAlertMessage(t('classes.updateSuccess'), 'success');
    await fetchClasses();
  }
};

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