<script setup lang="ts">
// import Input from '../components/shared/input.vue';
// import Select from '../components/shared/select.vue';
import { ref } from 'vue';
import DataTable from '../components/shared/DataTable.vue';
// const selectedValue = ref('')
// const options = [
//   { label: 'Option 1', value: '1' },
//   { label: 'Option 2', value: '2' },
//   { label: 'Option 3', value: '3' }
// ]

// const handleValidation = ({ isValid, errors }: { isValid: boolean, errors: string[] }) => {
//   console.log('Validation:', isValid, errors)
// }
const columns = [
{
    key: 'id',
    label: 'ID',
    type: 'text',
    sortable: true,
    filterable: true,
    filterType: 'text'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    sortable: true,
    filterable: true,
    filterType: 'text'
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ],
    selectOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ]
  },
  {
    key: 'avatar',
    label: 'Avatar',
    type: 'image'
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'actions',
    actions: [
      { icon: 'edit', label: 'Edit', color: '#2c3e50' },
      { icon: 'delete', label: 'Delete', color: '#e74c3c' }
    ]
  }
];

// State management
const sortBy = ref('');
const sortDirection = ref('asc');
const currentPage = ref(1);
const filters = ref({});
const searchQuery = ref('');
const loading = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const tableData = ref([]);

// Event handlers
const handleAction = ({ action, row }: { action: string, row: any }) => {
  console.log('Action:', action, 'Row:', row);
};

const handleIconClick = ({ column, row }: { column: string, row: any }) => {
  console.log('Icon clicked:', column, 'Row:', row);
};

const handleSelectChange = ({ column, value, row }: { column: string, value: string, row: any }) => {
  console.log('Select changed:', column, value, 'Row:', row);
};

const handleCheckboxChange = ({ column, value, row }: { column: string, value: string, row: any }) => {
  console.log('Checkbox changed:', column, value, 'Row:', row);
};
</script>

<template>
  <div class="dashboard">
    <!-- <Input
    v-model="value"
    id="user-name"
    label="Username"
    placeholder="Enter your username"
    :validation-rules="['required', 'email']"
    :suggestions="['Alice', 'Bob', 'Charlie']"
    @validation-change="({ isValid, errors }) => { validationErrors = errors }"
    @suggestion-selected="(val) => console.log('Suggestion selected:', val)"
  /> -->
    <!-- <div class="col-4">
      <Select
    v-model="selectedValue"
    id="my-select"
    label="Select an option"
    :options="options"
    placeholder="Choose an option"
    :validation-rules="['required']"
    @validation-change="handleValidation"
  />
    </div>
    <div class="col-4">
      <Select
    v-model="selectedValue"
    id="my-select"
    label="Select an option"
    :options="options"
    placeholder="Choose an option"
    :validation-rules="['required']"
    @validation-change="handleValidation"
  /> -->
  <!-- <DataTable
    v-model:sortBy="sortBy"
    v-model:sortDirection="sortDirection"
    v-model:currentPage="currentPage"
    v-model:filters="filters"
    v-model:searchQuery="searchQuery"
    :columns="columns"
    :data="tableData"
    :loading="loading"
    :totalItems="totalItems"
    :itemsPerPage="itemsPerPage"
    @action="handleAction"
    @iconClick="handleIconClick"
    @selectChange="handleSelectChange"
    @checkboxChange="handleCheckboxChange"
  /> -->
    </div>
    <h2>Welcome to Dashboard</h2>
    <div>
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <h3>Total Users</h3>
        <p class="number">1,234</p>
      </div>
      <div class="dashboard-card">
        <h3>Active Sessions</h3>
        <p class="number">56</p>
      </div>
      <div class="dashboard-card">
        <h3>Total Revenue</h3>
        <p class="number">$12,345</p>
      </div>
      <div class="dashboard-card">
        <h3>Pending Tasks</h3>
        <p class="number">23</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 1rem;
}

.dashboard h2 {
  margin-bottom: 2rem;
  color: #2c3e50;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.dashboard-card h3 {
  margin: 0;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
}

.dashboard-card .number {
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}
</style> 