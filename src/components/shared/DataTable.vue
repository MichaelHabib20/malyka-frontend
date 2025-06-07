<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Input from './input.vue';
import Select from './select.vue';

interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'icon' | 'checkbox' | 'select' | 'image' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: any }[];
  width?: string;
  icon?: string;
  iconColor?: string;
  selectOptions?: { label: string; value: any }[];
  actions?: { icon: string; label: string; color?: string }[];
}

interface Props {
  columns: Column[];
  data: any[];
  loading?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentPage?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
  searchQuery?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  totalItems: 0,
  itemsPerPage: 10,
  currentPage: 1,
  sortBy: '',
  sortDirection: 'asc',
  filters: () => ({}),
  searchQuery: ''
});

const emit = defineEmits<{
  (e: 'update:sortBy', value: string): void;
  (e: 'update:sortDirection', value: 'asc' | 'desc'): void;
  (e: 'update:currentPage', value: number): void;
  (e: 'update:filters', value: Record<string, any>): void;
  (e: 'update:searchQuery', value: string): void;
  (e: 'action', payload: { action: string; row: any }): void;
  (e: 'iconClick', payload: { column: string; row: any }): void;
  (e: 'selectChange', payload: { column: string; value: any; row: any }): void;
  (e: 'checkboxChange', payload: { column: string; value: boolean; row: any }): void;
}>();

const localFilters = ref<Record<string, any>>({ ...props.filters });
const localSearchQuery = ref(props.searchQuery);

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Watch for external search query changes
watch(() => props.searchQuery, (newQuery) => {
  localSearchQuery.value = newQuery;
});

const handleSort = (column: Column) => {
  if (!column.sortable) return;
  
  const newDirection = props.sortBy === column.key && props.sortDirection === 'asc' ? 'desc' : 'asc';
  emit('update:sortBy', column.key);
  emit('update:sortDirection', newDirection);
};

const handleFilterChange = (column: string, value: any) => {
  localFilters.value[column] = value;
  emit('update:filters', { ...localFilters.value });
};

const handleSearchChange = (value: string) => {
  localSearchQuery.value = value;
  emit('update:searchQuery', value);
};

const handlePageChange = (page: number) => {
  emit('update:currentPage', page);
};

const handleAction = (action: string, row: any) => {
  emit('action', { action, row });
};

const handleIconClick = (column: string, row: any) => {
  emit('iconClick', { column, row });
};

const handleSelectChange = (column: string, value: any, row: any) => {
  emit('selectChange', { column, value, row });
};

const handleCheckboxChange = (column: string, value: boolean, row: any) => {
  emit('checkboxChange', { column, value, row });
};

const resetFilters = () => {
  localFilters.value = {};
  localSearchQuery.value = '';
  emit('update:filters', {});
  emit('update:searchQuery', '');
};

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));
</script>

<template>
  <div class="data-table-container">
    <!-- Search and Filters Section -->
    <div class="table-controls">
      <div class="search-section">
        <Input
          v-model="localSearchQuery"
          placeholder="Search..."
          @update:modelValue="handleSearchChange"
          class="search-input"
        />
      </div>

      <div class="filters-section">
        <div v-for="column in columns.filter(col => col.filterable)" :key="column.key" class="filter-item">
          <template v-if="column.filterType === 'select'">
            <Select
              v-model="localFilters[column.key]"
              :compact="true"
              :options="column.filterOptions || []"
              :placeholder="`Filter by ${column.label}`"
              @update:modelValue="(val) => handleFilterChange(column.key, val)"
            />
          </template>
          <template v-else-if="column.filterType === 'date'">
            <Input
              v-model="localFilters[column.key]"
              type="date"
              :compact="true"
              :placeholder="`Filter by ${column.label}`"
              @update:modelValue="(val: any) => handleFilterChange(column.key, val)"
            />
          </template>
          <template v-else>
            <Input
              v-model="localFilters[column.key]"
              :type="column.filterType || 'text'"
              :compact="true"
              :placeholder="`Filter by ${column.label}`"
              @update:modelValue="(val: any) => handleFilterChange(column.key, val)"
            />
          </template>
        </div>
        <button class="reset-filters" @click="resetFilters">
          Reset Filters
        </button>
      </div>
    </div>

    <!-- Pagination at top -->
    <div class="pagination-top" v-if="totalPages > 1">
      <div class="pagination-info">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} entries
      </div>
      <div class="pagination-controls">
        <button 
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
          class="pagination-button"
        >
          Previous
        </button>
        <button 
          v-for="page in totalPages" 
          :key="page"
          :class="['pagination-button', { active: page === currentPage }]"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        <button 
          :disabled="currentPage === totalPages"
          @click="handlePageChange(currentPage + 1)"
          class="pagination-button"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :style="{ width: column.width }"
              :class="{ sortable: column.sortable }"
              @click="handleSort(column)"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon">
                {{ sortBy === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!loading && data.length > 0">
            <tr v-for="(row, index) in data" :key="index">
              <td v-for="column in columns" :key="column.key">
                <!-- Text/Number/Date -->
                <template v-if="['text', 'number', 'date'].includes(column.type)">
                  {{ row[column.key] }}
                </template>

                <!-- Icon -->
                <template v-else-if="column.type === 'icon'">
                  <i 
                    :class="['icon', column.icon]"
                    :style="{ color: column.iconColor }"
                    @click="handleIconClick(column.key, row)"
                  ></i>
                </template>

                <!-- Checkbox -->
                <template v-else-if="column.type === 'checkbox'">
                  <input 
                    type="checkbox"
                    :checked="row[column.key]"
                    @change="handleCheckboxChange(column.key, $event?.target?.checked, row)"
                  >
                </template>

                <!-- Select -->
                <template v-else-if="column.type === 'select'">
                  <Select
                    :modelValue="row[column.key]"
                    :options="column.selectOptions || []"
                    @update:modelValue="(val) => handleSelectChange(column.key, val, row)"
                  />
                </template>

                <!-- Image -->
                <template v-else-if="column.type === 'image'">
                  <img 
                    :src="row[column.key]" 
                    :alt="row[column.key + '_alt'] || ''"
                    class="table-image"
                  >
                </template>

                <!-- Actions -->
                <template v-else-if="column.type === 'actions'">
                  <div class="actions-cell">
                    <button 
                      v-for="action in column.actions" 
                      :key="action.icon"
                      class="action-button"
                      :style="{ color: action.color }"
                      @click="handleAction(action.label, row)"
                      :title="action.label"
                    >
                      <i :class="['icon', action.icon]"></i>
                    </button>
                  </div>
                </template>
              </td>
            </tr>
          </template>
          <tr v-else-if="loading">
            <td :colspan="columns.length" class="loading-state">
              Loading...
            </td>
          </tr>
          <tr v-else>
            <td :colspan="columns.length" class="empty-state">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-controls {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-section {
  width: 100%;
  max-width: 300px;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: start;
}

.filter-item {
  min-width: 200px;
}

.reset-filters {
  padding: 0.2rem 1rem;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #2c3e50;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  height: 36px;
}

.reset-filters:hover {
  background: #eee;
}

.pagination-top {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.pagination-controls {
  display: flex;
  gap: 0.5rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f5f5f5;
}

.pagination-button.active {
  background: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  background: #f0f0f0;
}

.sort-icon {
  margin-left: 0.5rem;
  opacity: 0.5;
}

.table-image {
  max-width: 50px;
  max-height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.action-button:hover {
  background: #f5f5f5;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.icon {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
  }

  .search-section {
    max-width: 100%;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
  }

  .pagination-top {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style> 