<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Input from './input.vue';
import Select from './select.vue';
import type { Column } from '../../interfaces/column';
import type { Props } from '../../interfaces/props';
import type { CustomButton } from '../../interfaces/customButtons';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();


const props = withDefaults(defineProps<Props & {
  customButtons?: CustomButton[];
  selectedRows?: any[];
  showSelection?: boolean;
}>(), {
  loading: false,
  totalItems: 0,
  itemsPerPage: 10,
  currentPage: 1,
  sortBy: '',
  sortDirection: 'asc',
  filters: () => ({}),
  searchQuery: '',
  searchPlaceholder: 'Search...',
  customButtons: () => [],
  removeLeadingZero: false,
  showSelection: false
});

const emit = defineEmits<{
  (e: 'update:sortBy', value: string): void;
  (e: 'update:sortDirection', value: 'asc' | 'desc'): void;
  (e: 'update:currentPage', value: number): void;
  (e: 'update:filters', value: Record<string, any>): void;
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:enterKey', value: boolean): void;
  (e: 'action', payload: { action: string; row: any }): void;
  (e: 'iconClick', payload: { column: string; row: any }): void;
  (e: 'selectChange', payload: { column: string; value: any; row: any }): void;
  (e: 'checkboxChange', payload: { column: string; value: boolean; row: any }): void;
  (e: 'buttonClick', payload: { buttonId: string; button: CustomButton }): void;
  (e: 'update:selectedRows', value: any[]): void;
  (e: 'numberClick', payload: { column: string; value: any; row: any }): void;
  (e: 'cellEdit', payload: { column: string; value: any; row: any; originalValue: any }): void;
}>();

const localFilters = ref<Record<string, any>>({ ...props.filters });
const localSearchQuery = ref(props.searchQuery);
const searchInputRef = ref<HTMLInputElement | null | any>(null);
const showMoreDropdown = ref(false);

// Editable cell state
const editingCell = ref<{ rowIndex: number; columnKey: string } | null>(null);
const editingValue = ref<any>('');
const editingError = ref<string | null>(null);

// Row selection logic
const selectedRows = ref<any[]>(props.selectedRows ? [...props.selectedRows] : []);

watch(() => props.selectedRows, (newVal) => {
  if (newVal) selectedRows.value = [...newVal];
}, { deep: true });

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

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // Trigger search on Enter key press
    emit('update:enterKey', true);
    
    // Select all text in the search input after a brief delay
    setTimeout(() => {
      if (searchInputRef.value && searchInputRef.value.inputElement) {
        searchInputRef.value.inputElement.select();
      }
    }, 100);
  }
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

const handleButtonClick = (buttonId: string, button: CustomButton) => {
  emit('buttonClick', { buttonId, button });
};

const handleNumberClick = (column: string, value: any, row: any) => {
  emit('numberClick', { column, value, row });
  
  // If the column has a route configuration, navigate automatically
  const columnConfig = props.columns.find(col => col.key === column);
  if (columnConfig?.routeConfig) {
    const routePath = typeof columnConfig.routeConfig === 'string' 
      ? columnConfig.routeConfig 
      : columnConfig.routeConfig.path;
    
    const routeParams = typeof columnConfig.routeConfig === 'string'
      ? { id: value }
      : columnConfig.routeConfig.params ? columnConfig.routeConfig.params(row, value) : { id: value };
    
    // Simple path replacement for navigation
    let path = routePath;
    // Object.entries(routeParams).forEach(([key, val]) => {
    //   path = path.replace(`:${key}`, String(val));
    // });
    path = path.replace(':gradeId', String(value));
    router.push(path);
  }
};

// Editable cell functions
const startEditing = (rowIndex: number, columnKey: string, value: any) => {
  editingCell.value = { rowIndex, columnKey };
  editingValue.value = value;
  editingError.value = null;
};

const cancelEditing = () => {
  editingCell.value = null;
  editingValue.value = '';
  editingError.value = null;
  // console.log('cancelEditing', editingCell.value);
};

const saveEditing = () => {
  const columnConfig = props.columns.find(col => col.key === editingCell.value?.columnKey);
  
  // Validate if validation function exists
  if (columnConfig?.editableValidation) {
    const error = columnConfig.editableValidation(editingValue.value);
    if (error) {
      editingError.value = error;
      return;
    }
  }
  
  if (editingCell.value) {
    const row = props.data[editingCell.value.rowIndex];
    const originalValue = getNestedValue(row, editingCell.value.columnKey);
    
    emit('cellEdit', {
      column: editingCell.value.columnKey,
      value: editingValue.value,
      row,
      originalValue
    });
  }
  
  cancelEditing();
};

const handleEditKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveEditing();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelEditing();
  }
};

const handleEditBlur = (event: FocusEvent) => {
  // Use setTimeout to allow click events on action buttons to fire first
  setTimeout(() => {
    // Check if the new focus target is within the editable cell
    const target = event.relatedTarget as Element;
    if (!target || !target.closest('.editable-cell')) {
      // If clicking outside the editable cell, cancel the edit
      cancelEditing();
    }
  }, 100);
};

const resetFilters = () => {
  localFilters.value = {};
  localSearchQuery.value = '';
  emit('update:filters', {});
  emit('update:searchQuery', '');
};

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

const hasActiveFilters = computed(() => {
  // Check if there are any non-empty filters
  const hasFilters = Object.values(localFilters.value).some(value => 
    value !== null && value !== undefined && value !== ''
  );
  return hasFilters;
});

const isMobile = computed(() => {
  return window.innerWidth < 768;
});

const visibleButtons = computed(() => {
  return props.customButtons.slice(0, 3);
});

const hiddenButtons = computed(() => {
  return props.customButtons.slice(3);
});

const hasHiddenButtons = computed(() => {
  return hiddenButtons.value.length > 0;
});

const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.dropdown')) {
    showMoreDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const isRowSelected = (row: any) => {
  return selectedRows.value.some(r => r.id === row.id);
};

const toggleRowSelection = (row: any) => {
  const idx = selectedRows.value.findIndex(r => r.id === row.id);
  if (idx === -1) {
    selectedRows.value.push(row);
  } else {
    selectedRows.value.splice(idx, 1);
  }
  emit('update:selectedRows', [...selectedRows.value]);
};

const isAllPageSelected = computed(() => {
  if (!props.data.length) return false;
  return props.data.every(row => selectedRows.value.some(r => r.id === row.id));
});

const toggleSelectAllPage = () => {
  if (isAllPageSelected.value) {
    // Unselect all rows on this page
    selectedRows.value = selectedRows.value.filter(r => !props.data.some(row => row.id === r.id));
  } else {
    // Add all rows on this page
    const newRows = props.data.filter(row => !selectedRows.value.some(r => r.id === row.id));
    selectedRows.value = [...selectedRows.value, ...newRows];
  }
  emit('update:selectedRows', [...selectedRows.value]);
};

// Utility function to get nested object values
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Function to format dates
const formatDate = (dateValue: any, format?: string) => {
  if (!dateValue) return '';
  
  try {
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateValue;
    // If a specific format is provided, use it
    if (format) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: format.includes('short') ? 'short' : 'long',
        day: 'numeric',
        ...(format.includes('time') && {
          hour: '2-digit',
          minute: '2-digit'
        })
      }).format(date);
    }
    // Default format: MM/DD/YYYY
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (error) {
    // If formatting fails, return the original value
    return dateValue;
  }
};

// Function to determine grade chip color class based on content
const getGradeChipClass = (gradeText: string) => {
  if (!gradeText) return 'grade-chip-primary';
  
  const text = gradeText.toLowerCase();
  
  // Baby Class - Soft blue
  if (text.includes('baby')) {
    return 'grade-chip-baby';
  }
  
  // KG1 - Green
  if (text.includes('kg1')) {
    return 'grade-chip-kg1';
  }
  
  // KG2 - Orange
  if (text.includes('kg2')) {
    return 'grade-chip-kg2';
  }
  
  // KG3 - Purple
  if (text.includes('kg3')) {
    return 'grade-chip-kg3';
  }
  
  // Primary grades - Blue
  if (text.includes('primary') || text.includes('1') || text.includes('2') || text.includes('3')) {
    return 'grade-chip-primary';
  }
  
  // Boys - Blue variant
  if (text.includes('boys')) {
    return 'grade-chip-boys';
  }
  
  // Girls - Pink variant
  if (text.includes('girls')) {
    return 'grade-chip-girls';
  }
  
  // Default
  return 'grade-chip-default';
};
</script>

<template>
  <div class="data-table-container">
    <!-- Search and Filters Section -->
    <div class="mb-3 d-flex flex-column">
      <!-- Desktop Layout -->
      <div class="d-flex justify-content-between desktop-layout" v-if="!isMobile">
        <div class="search-section">
        <Input
          id="table-search"
          leadingIcon="fa-solid fa-magnifying-glass"
          v-model="localSearchQuery"
          :placeholder="searchPlaceholder"
          @update:modelValue="handleSearchChange"
          @keydown="handleSearchKeydown"
          :removeLeadingZero="true"
          class="search-input"
          ref="searchInputRef"
        />
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <button 
          v-for="button in visibleButtons"
          :key="button.id"
          :class="['btn', button.variant || 'btn-primary']"
          @click="handleButtonClick(button.id, button)"
          :disabled="button.disabled || button.loading"
        >
          <i :class="['fa-solid', button.icon]"></i>
          {{ button.loading ? button.loadingText : t(button.label) }}
        </button>
        
        <!-- More dropdown for desktop -->
        <div v-if="hasHiddenButtons" class="dropdown">
          <button 
            class="btn btn-secondary more-button"
            @click="showMoreDropdown = !showMoreDropdown"
            type="button"
          >
            <i class="fa-solid fa-ellipsis"></i>
           
          </button>
          <div v-if="showMoreDropdown" class="dropdown-menu show">
            <button 
              v-for="button in hiddenButtons"
              :key="button.id"
              class="mb-2"
              :class="['dropdown-item', button.variant || 'btn-primary']"
              @click="handleButtonClick(button.id, button); showMoreDropdown = false"
              :disabled="button.disabled || button.loading"
            >
              <i :class="['fa-solid', button.icon]"></i>
              {{ button.loading ? button.loadingText : t(button.label) }}
            </button>
          </div>
        </div>
      </div>

      </div>

      <!-- Mobile Layout -->
      <div class="mobile-layout" v-if="isMobile">
        <div class="search-section">
          <Input
            id="table-search-mobile"
            leadingIcon="fa-solid fa-magnifying-glass"
            v-model="localSearchQuery"
            :placeholder="searchPlaceholder"
            @update:modelValue="handleSearchChange"
            @keydown="handleSearchKeydown"
            :removeLeadingZero="true"
            class="search-input"
            ref="searchInputRef"
          />
        </div>

        <div class="mobile-buttons">
          <!-- Show first button if available -->
          <button 
            v-if="customButtons.length > 0"
            :key="customButtons[0].id"
            :class="['btn', customButtons[0].variant || 'btn-primary']"
            @click="handleButtonClick(customButtons[0].id, customButtons[0])"
            :disabled="customButtons[0].disabled || customButtons[0].loading"
          >
            <i :class="['fa-solid', customButtons[0].icon]"></i>
            {{ customButtons[0].loading ? customButtons[0].loadingText : t(customButtons[0].label) }}
          </button>

          <!-- More dropdown for mobile -->
          <div v-if="customButtons.length > 1" class="dropdown">
            <button 
              class="btn btn-secondary more-button"
              @click="showMoreDropdown = !showMoreDropdown"
              type="button"
            >
              <i class="fa-solid fa-ellipsis"></i>
            </button>
            <div v-if="showMoreDropdown" class="dropdown-menu show">
              <button 
                v-for="button in customButtons.slice(1)"
                :key="button.id"
                class="mb-2"
                :class="['dropdown-item', button.variant || 'btn-primary']"
                @click="handleButtonClick(button.id, button); showMoreDropdown = false"
                :disabled="button.disabled || button.loading"
              >
                <i :class="['fa-solid', button.icon]"></i>
                {{ button.loading ? button.loadingText : t(button.label) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-3 align-items-start mt-4">
        <div v-for="column in columns.filter(col => col.filterable)" :key="column.key" class="filter-item">
          <template v-if="column.filterType === 'select'">
            <Select
              v-model="localFilters[column.key]"
              :compact="true"
              :options="column.filterOptions || []"
              :placeholder="t('datatable.filterBy', { label: column.label })"
              @update:modelValue="(val) => handleFilterChange(column.key, val)"
            />
          </template>
          <template v-else-if="column.filterType === 'date'">
            <Input
              :id="`filter-${column.key}-date`"
              v-model="localFilters[column.key]"
              type="date"
              :compact="true"
              :placeholder="t('datatable.filterBy', { label: column.label })"
              @update:modelValue="(val: any) => handleFilterChange(column.key, val)"
            />
          </template>
          <template v-else>
            <Input
              :id="`filter-${column.key}`"
              v-model="localFilters[column.key]"
              :type="column.filterType || 'text'"
              :compact="true"
              :placeholder="t('datatable.filterBy', { label: column.label })"
              @update:modelValue="(val: any) => handleFilterChange(column.key, val)"
            />
          </template>
        </div>
        <button v-if="hasActiveFilters" class="reset-filters" @click="resetFilters">
          {{ t('datatable.resetFilters') }}
        </button>
      </div>
    </div>

    <!-- Pagination at top -->
    <div class="pagination-top" v-if="totalPages > 1">
      <div class="pagination-info">
        {{ t('datatable.showingEntries', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, totalItems), total: totalItems }) }}
      </div>
      <div class="d-flex gap-2">
        <button 
          :disabled="currentPage === 1"
          @click="handlePageChange(currentPage - 1)"
          class="pagination-button"
        >
          {{ t('datatable.previous') }}
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
          {{ t('datatable.next') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="data-table table">
        <thead>
          <tr>
            <th v-if="showSelection" style="width: 40px;">
              <input type="checkbox" :checked="isAllPageSelected" @change="toggleSelectAllPage" />
            </th>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :style="{ width: column.width }"
              :class="{ sortable: column.sortable, 'text-start': column.align === 'left', 'text-end': column.align === 'right', 'text-center': column.align === 'center' }"
              @click="handleSort(column)"
            >
              <span >{{ column.label }}</span>
              <span v-if="column.sortable" class="sort-icon">
                {{ sortBy === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!loading && data.length > 0">
            <tr v-for="(row, index) in data" :key="index">
              <td v-if="showSelection">
                <input type="checkbox" :checked="isRowSelected(row)" @change="toggleRowSelection(row)" />
              </td>
              <td v-for="column in columns" :key="column.key" :class="{ 'text-start': column.align === 'left', 'text-end': column.align === 'right', 'text-center': column.align === 'center' }">
                <!-- Text/Number/Date -->
                <template v-if="['text', 'number'].includes(column.type)">
                  <span v-if="column.isMainColumn" class="d-block fit-width">
                    <strong>{{ getNestedValue(row, column.key) ? getNestedValue(row, column.key) : '-' }}</strong>
                  </span>
                  <span v-else class="min-width-100">
                    {{ getNestedValue(row, column.key) ? getNestedValue(row, column.key) : '-' }}
                  </span>
                </template>
                <template v-else-if="column.type === 'date'">
                  <span class="d-block fit-width"  >
                    {{ formatDate(getNestedValue(row, column.key), column.dateFormat) ? formatDate(getNestedValue(row, column.key), column.dateFormat) : '-' }}
                  </span>
                </template>

                <!-- Icon -->
                <template v-else-if="column.type === 'icon'">
                  <i 
                    :class="['icon', column.icon]"
                    :style="{ color: column.iconColor }"
                    @click="handleIconClick(column.key, row)"
                  ></i>
                </template>

                <template v-else-if="column.type === 'code'">
                  <span class="code-badge">{{ getNestedValue(row, column.key) }}</span>
                </template>

                <template v-else-if="column.type === 'attendance-status'">
                  <span 
                      :class="[
                        'status-badge',
                        getNestedValue(row, column.key) ? 'status-present' : 'status-absent'
                      ]"
                    >
                      <i :class="getNestedValue(row, column.key) ? 'fa-solid fa-check' : 'fa-solid fa-times'"></i>
                      {{ getNestedValue(row, column.key) ? t('datatable.present') : t('datatable.absent') }}
                    </span>
                </template>
                <template v-else-if="column.type === 'percentage'">
                  <span :class="[
                    'percentage-value',
                    { 'percentage-low': getNestedValue(row, column.key) < 50, 'percentage-high': getNestedValue(row, column.key) >= 50 }
                  ]">
                    {{ getNestedValue(row, column.key) }}%
                  </span>
                </template>

                <!-- Clickable Number -->
                <template v-else-if="column.type === 'clickable-number'">
                  <span 
                    class="clickable-number"
                    @click="handleNumberClick(column.key, getNestedValue(row, column.nestedStructureForClickableNumber!), row)"
                    :title="column.tooltip || t('datatable.clickToViewDetails', { value: getNestedValue(row, column.key) })"
                  >
                    {{ getNestedValue(row, column.key) }}
                    <i class="fa-solid fa-external-link-alt clickable-icon"></i>
                  </span>
                </template>

                <!-- Grade Chip -->
                <template v-else-if="column.type === 'grade-chip'">
                  <div class="grade-chip-container d-flex justify-content-center">
                    <span 
                      class="grade-chip badge rounded-pill fw-semibold text-uppercase"
                      :class="getGradeChipClass(getNestedValue(row, column.key))"
                      :title="getNestedValue(row, column.key)"
                    >
                      {{ getNestedValue(row, column.key) }}
                    </span>
                  </div>
                </template>

                <!-- Phone Chip -->
                <template v-else-if="column.type === 'phone-chip'">
                  <div class="phone-chip-container d-flex justify-content-center" v-if="getNestedValue(row, column.key)">
                    <a 
                      :href="`tel:${getNestedValue(row, column.key)}`"
                      class="phone-chip btn btn-sm btn-outline-success text-decoration-none"
                      :title="t('datatable.call', { value: getNestedValue(row, column.key) })"
                    >
                      <i class="fa-solid fa-phone me-1" v-if="getNestedValue(row, column.key)"></i>
                      {{ getNestedValue(row, column.key) }}
                    </a>
                  </div>
                  <span v-else>-</span>
                </template>

                <!-- Checkbox -->
                <template v-else-if="column.type === 'checkbox'">
                  <input 
                    type="checkbox"
                    :checked="getNestedValue(row, column.key)"
                    class="checkbox-input"
                    @change="handleCheckboxChange(column.key, ($event.target as HTMLInputElement).checked, row)"
                  >
                </template>

                <!-- Select -->
                <template v-else-if="column.type === 'select'">
                  <Select
                    :modelValue="getNestedValue(row, column.key)"
                    :options="column.selectOptions || []"
                    @update:modelValue="(val) => handleSelectChange(column.key, val, row)"
                  />
                </template>

                <!-- Editable -->
                <template v-else-if="column.type === 'editable'">
                  <div class="editable-cell">
                    <!-- Display mode -->
                    <div 
                      v-if="editingCell?.rowIndex !== index || editingCell?.columnKey !== column.key"
                      class="editable-display"
                      @click="startEditing(index, column.key, getNestedValue(row, column.key))"
                      :title="t('datatable.clickToEdit')"
                    >
                      <span class="editable-value">{{ getNestedValue(row, column.key) || '-' }}</span>
                      <i class="fa-solid fa-edit editable-icon"></i>
                    </div>
                    
                    <!-- Edit mode -->
                    <div v-else class="editable-edit">
                      <div class="editable-input-container">
                        <input
                          v-if="column.editableType !== 'textarea'"
                          v-model="editingValue"
                          :type="column.editableType || 'text'"
                          :placeholder="column.editablePlaceholder || t('datatable.enterValue')"
                          class="editable-input"
                          @click.stop
                          @keydown="handleEditKeydown"
                          @blur="handleEditBlur"
                          ref="editingInputRef"
                        />
                        <textarea
                          v-else
                          v-model="editingValue"
                          :placeholder="column.editablePlaceholder || t('datatable.enterValue')"
                          class="editable-textarea"
                          @click.stop
                          @keydown="handleEditKeydown"
                          @blur="handleEditBlur"
                          rows="2"
                        ></textarea>
                        
                        <!-- Error message -->
                        <div v-if="editingError" class="editable-error">
                          {{ editingError }}
                        </div>
                        
                        <!-- Action buttons -->
                        <div class="editable-actions">
                          <button 
                            class="editable-btn editable-btn-save"
                            @click.stop="saveEditing"
                            :title="t('datatable.save')"
                          >
                            <i class="fa-solid fa-check"></i>
                          </button>
                          <button 
                            class="editable-btn editable-btn-cancel"
                            @click.stop="cancelEditing"
                            :title="t('datatable.cancel')"
                          >
                            <i class="fa-solid fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Image -->
                <template v-else-if="column.type === 'image'">
                  <img 
                    :src="getNestedValue(row, column.key)" 
                    :alt="getNestedValue(row, column.key + '_alt') || ''"
                    class="table-image"
                    v-if="getNestedValue(row, column.key)"
                  >
                  <span v-else>-</span>
                </template>

                <!-- Actions -->
                <template v-else-if="column.type === 'actions'">
                  
                  <div class="d-flex gap-2">
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
            <td :colspan="columns.length" class="text-center py-4 text-muted">
              {{ t('datatable.loading') }}
            </td>
          </tr>
          <tr v-else>
            <td :colspan="columns.length" class="text-center py-4 text-muted">
              {{ t('datatable.noData') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles that can't be replaced with Bootstrap classes */
.data-table-container {
  /* background: white; */
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-section {
  width: 100%;
  max-width: 300px;
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

/* Responsive Layout Styles */
.desktop-layout {
  display: flex;
}

.mobile-layout {
  display: none;
}

/* Dropdown Styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  min-width: 160px;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.375rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #16181b;
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* Mobile Layout Styles */
.mobile-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: center;
}

.pagination-top {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  overflow-x: auto;
}

.data-table th,
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #e2e2e2;
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

.icon {
  font-size: 1.1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .search-section {
    max-width: 100%;
  }

  .filter-item {
    width: 100%;
  }

  .reset-filters {
    width: 100%;
    margin-top: 0.5rem;
  }

  .pagination-top {
    flex-direction: column;
    gap: 1rem;
  }

  .mobile-buttons {
    justify-content: space-between;
    max-width: 100%;
  }

  .mobile-buttons .btn {
    flex: 1;
    max-width: calc(50% - 0.25rem);
  }

  .dropdown-menu {
    right: auto;
    left: -117px;
    min-width: 200px;
  }
}

/* Enhanced Responsive Design */
/* Tablet Styles (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .data-table-container {
    margin: 0 0.5rem;
  }

  .search-section {
    max-width: 250px;
  }

  .filter-item {
    min-width: 180px;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .pagination-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

/* Mobile Styles (up to 768px) */
@media (max-width: 768px) {
  .data-table-container {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
    border: 1px solid #eee;
  }

  .search-section {
    max-width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .filter-item {
    width: 100%;
    min-width: unset;
  }

  .reset-filters {
    width: 100%;
    margin-top: 0.5rem;
  }

  .pagination-top {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    text-align: center;
  }

  .pagination-info {
    font-size: 0.85rem;
    color: #666;
  }

  .pagination-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    min-width: 40px;
  }

  /* Mobile table layout */
  .data-table {
    min-width: 600px; /* Ensure minimum width for readability */
    font-size: 0.8rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.6rem 0.4rem;
    white-space: nowrap;
  }

  .data-table th {
    font-size: 0.75rem;
    padding: 0.5rem 0.4rem;
  }

  /* Compact action buttons */
  .action-button {
    padding: 0.2rem;
    font-size: 0.9rem;
  }

  /* Compact custom buttons */
  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  /* Compact status badges */
  .status-badge {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  /* Compact percentage values */
  .percentage-value {
    padding: 0.2rem 0.5rem;
    font-size: 0.75rem;
    min-width: 50px;
  }

  /* Compact code badges */
  .code-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }

  /* Compact table images */
  .table-image {
    max-width: 40px;
    max-height: 40px;
  }

  /* Compact clickable numbers */
  .clickable-number {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }
  
  .clickable-icon {
    font-size: 0.7rem;
  }
}


/* Landscape Mobile Styles */
@media (max-width: 768px) and (orientation: landscape) {
  .search-section {
    max-width: 200px;
  }

  .filter-item {
    width: auto;
    min-width: 150px;
  }

  .pagination-top {
    flex-direction: row;
    align-items: center;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .data-table {
    border-width: 0.5px;
  }

  .data-table th,
  .data-table td {
    border-bottom-width: 0.5px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .data-table th.sortable:hover {
    background: #f8f9fa;
  }

  .action-button:hover {
    background: none;
  }

  .pagination-button:hover:not(:disabled) {
    background: white;
  }

  .btn:hover:not(:disabled) {
    transform: none;
  }

  /* Increase touch targets */
  .action-button {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pagination-button {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn {
    min-height: 44px;
  }

  /* Increase touch targets for clickable numbers */
  .clickable-number {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
  }
}

.checkbox-input{
  cursor: pointer !important;
}
.code-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
}
/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-present {
  background: #dcfce7;
  color: #166534;
}

.status-absent {
  background: #fee2e2;
  color: #991b1b;
}

/* Button Variants */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

/* Percentage Column Styling */
.percentage-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  transition: all 0.2s ease;
}

.percentage-low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.percentage-low:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.percentage-high {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.percentage-high:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* Clickable Number Styling */
.clickable-number {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  color: #4f46e5;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.clickable-number:hover {
  background: #f3f4f6;
  border-color: #4f46e5;
  color: #3730a3;
}

.clickable-number:active {
  background: #e5e7eb;
}

.clickable-number:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.clickable-icon {
  font-size: 0.75rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.clickable-number:hover .clickable-icon {
  opacity: 1;
}

.more-button{
  display: flex;
  height: 48px
}

/* Grade Chip Container - Ensures consistent width */
.grade-chip-container {
  width: 100%;
  min-width: 120px;
}

/* Base Grade Chip Styling */
.grade-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  white-space: nowrap;
  width: 100%;
  max-width: 140px;
  min-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grade-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Color Variants */
.grade-chip-baby {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
}

.grade-chip-kg1 {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.grade-chip-kg2 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.grade-chip-kg3 {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.grade-chip-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.grade-chip-middle {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.grade-chip-high {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.grade-chip-boys {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.grade-chip-girls {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: white;
}

.grade-chip-default {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

/* Responsive adjustments for grade chips */
@media (max-width: 768px) {
  .grade-chip-container {
    min-width: 100px;
  }
  
  .grade-chip {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    border-radius: 0.75rem;
    max-width: 120px;
  }
}

@media (max-width: 576px) {
  .grade-chip-container {
    min-width: 80px;
  }
  
  .grade-chip {
    padding: 0.2rem 0.4rem;
    font-size: 0.65rem;
    border-radius: 0.5rem;
    max-width: 100px;
  }
}

/* Phone Chip Styling */
.phone-chip-container {
  width: 100%;
  min-width: 140px;
}

.phone-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  width: 100%;
  max-width: 160px;
  min-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  border-radius: 6px;
  font-weight: 500;
}

.phone-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 135, 84, 0.2);
}

.phone-chip:active {
  transform: translateY(0);
}

/* Responsive adjustments for phone chips */
@media (max-width: 768px) {
  .phone-chip-container {
    min-width: 120px;
  }
  
  .phone-chip {
    max-width: 140px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .phone-chip-container {
    min-width: 100px;
  }
  
  .phone-chip {
    max-width: 120px;
    font-size: 0.75rem;
  }
}
.fit-width{
  width: 100%;
  text-wrap: nowrap;
}
.min-width-100{
  display: block;
  min-width: 100px;
}

/* Editable Cell Styles */
.editable-cell {
  position: relative;
  width: 100%;
}

.editable-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 32px;
}

.editable-display:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.editable-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editable-icon {
  font-size: 0.75rem;
  color: #6c757d;
  opacity: 0;
  transition: opacity 0.2s ease;
  margin-left: 0.5rem;
}

.editable-display:hover .editable-icon {
  opacity: 1;
}

.editable-edit {
  position: relative;
  width: 100%;
}

.editable-input-container {
  position: relative;
  width: 100%;
}

.editable-input,
.editable-textarea {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 2px solid #4f46e5;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
}

.editable-input:focus,
.editable-textarea:focus {
  outline: none;
  border-color: #3730a3;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.editable-textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.editable-error {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.editable-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: white;
  border-radius: 0 4px 4px 0;
  border: 2px solid #4f46e5;
  border-bottom: none;
}

.editable-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.editable-btn-save {
  background: #28a745;
  color: white;
}

.editable-btn-save:hover {
  background: #1e7e34;
}

.editable-btn-cancel {
  background: #dc3545;
  color: white;
}

.editable-btn-cancel:hover {
  background: #c82333;
}

/* Responsive adjustments for editable cells */
@media (max-width: 768px) {
  .editable-display {
    padding: 0.2rem 0.4rem;
    min-height: 28px;
  }
  
  .editable-input,
  .editable-textarea {
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
  }
  
  .editable-actions {
    position: static;
    margin-top: 0.5rem;
    justify-content: flex-end;
    background: none;
    border: none;
    padding: 0;
  }
  
  .editable-btn {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .editable-error {
    font-size: 0.7rem;
    margin-top: 0.2rem;
  }
}

/* Touch device optimizations for editable cells */
@media (hover: none) and (pointer: coarse) {
  .editable-display {
    min-height: 44px;
  }
  
  .editable-icon {
    opacity: 0.5;
  }
  
  .editable-btn {
    min-width: 44px;
    min-height: 44px;
  }
}
</style> 