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
const router = useRouter();

// Reactive data
const roles = ref<Role[]>([]);
const loading = ref(false);
const searchQuery = ref('');

// Define columns for roles table
const columns: Column[] = [

  {
    key: 'name',
    label: 'Role Name',
    type: 'text'
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'actions',
    actions: [
      { icon: 'fa-regular fa-edit', label: 'Edit', color: '#3b82f6' },
    //   { icon: 'fa-solid fa-trash', label: 'Delete', color: '#ef4444' }
    ],
    align: 'center',
    width: '120px'
  }
];

// Custom buttons
const customButtons: CustomButton[] = [
  {
    id: 'new-role',
    label: 'New Role',
    icon: 'fa-plus',
    variant: 'btn-primary'
  }
];

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
    // TODO: Implement new role creation logic
    // This could open a modal or navigate to a create role page
  }
};

const handleAction = ({ action, row }: { action: string; row: any }) => {
  
  if (action === 'Edit') {
    // TODO: Implement edit role logic
  } else if (action === 'Delete') {
    // TODO: Implement delete role logic
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