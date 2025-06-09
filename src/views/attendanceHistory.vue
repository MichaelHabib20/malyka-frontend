<template>
  <div class="attendance-history">
    <!-- Header Section -->
    <div class="header-section">
      <!-- Action Buttons -->
      <div class="action-buttons ms-auto">
        <button 
          class="btn btn-primary export-btn"
          @click="exportAttendance"
          :disabled="isExporting"
        >
          <i class="fa-solid fa-download"></i>
          {{ isExporting ? 'Exporting...' : 'Export Attendance' }}
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filter-card">
        
        <div class="filter-content">
          <!-- Date Range Type Selection -->
            <div class="d-flex justify-content-between align-items-center">
                <div class="filter-row">
            <div class="filter-group">
              <label class="filter-label">Date Range Type</label>
              <div class="radio-group">
                <label class="radio-item">
                  <input 
                    type="radio" 
                    v-model="dateType" 
                    value="single"
                    @change="resetDates"
                  />
                  <span class="radio-custom"></span>
                  Single Date
                </label>
                <label class="radio-item">
                  <input 
                    type="radio" 
                    v-model="dateType" 
                    value="range"
                    @change="resetDates"
                  />
                  <span class="radio-custom"></span>
                  Date Range
                </label>
              </div>
            </div>
          </div>
          <!-- Refresh Button -->
          <div class="filter-row mt-4">
            <div class="filter-group">
            <div class="refresh-container">
              <!-- <button 
                class="btn btn-outline refresh-btn"
                @click="getKidsData"
                :disabled="isLoading"
              >
                <i class="fa-solid fa-rotate"></i>
                {{ isLoading ? 'Loading...' : 'Refresh Data' }}
              </button> -->
            </div>
          </div>
            </div>
            </div>

          <!-- Date Pickers -->
          <div class="filter-row">
            <div class="date-pickers-container">
              <!-- Single Date -->
              <div v-if="dateType === 'single'" class="date-picker-wrapper">
                <DatePicker
                  id="single-date"
                  v-model="singleDate"
                  label="Select Date"
                  placeholder="Choose a date"
                  @update:modelValue="() => getKidsData('single')"
                />
              </div>
              
              <!-- Date Range -->
              <div v-if="dateType === 'range'" class="date-range-container">
                <div class="date-picker-wrapper">
                  <DatePicker
                    id="start-date"
                    v-model="startDate"
                    label="Start Date"
                    placeholder="Start date"
                    @update:modelValue="() => getKidsData('start')"
                  />
                </div>
                <div class="date-picker-wrapper">
                  <DatePicker
                    id="end-date"
                    v-model="endDate"
                    label="End Date"
                    placeholder="End date"
                    @update:modelValue="() => getKidsData('end')"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Summary Cards -->
    <div v-if="kids.length > 0" class="summary-section mb-4">
      <div class="summary-grid">
        <div class="summary-card present-card">
          <div class="summary-icon">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <div class="summary-content">
            <h4 class="summary-title">Present</h4>
            <p class="summary-value">{{ presentCount }}</p>
          </div>
        </div>
        
        <div class="summary-card absent-card">
          <div class="summary-icon">
            <i class="fa-solid fa-times-circle"></i>
          </div>
          <div class="summary-content">
            <h4 class="summary-title">Absent</h4>
            <p class="summary-value">{{ absentCount }}</p>
          </div>
        </div>
        
        <div class="summary-card total-card">
          <div class="summary-icon">
            <i class="fa-solid fa-users"></i>
          </div>
          <div class="summary-content">
            <h4 class="summary-title">Total</h4>
            <p class="summary-value">{{ kids.length }}</p>
          </div>
        </div>
        
        <div class="summary-card attendance-rate-card">
          <div class="summary-icon">
            <i class="fa-solid fa-percentage"></i>
          </div>
          <div class="summary-content">
            <h4 class="summary-title">Rate</h4>
            <p class="summary-value">{{ attendanceRate }}%</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Attendance Data Section -->
    <div class="data-section">
      <div class="data-card">
        <!-- Loading State -->
        <div v-if="isLoading && kids.length === 0" class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading attendance data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="kids.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fa-solid fa-calendar-xmark"></i>
          </div>
          <h3 class="empty-title">No Attendance Data</h3>
          <p class="empty-description">
            Select a date or date range to view attendance data.
          </p>
        </div>

        

        <!-- DataTable -->
        <div v-else class="table-container">

          <DataTable
            :columns="dynamicTableColumns"
            :data="filteredData"
            :loading="isLoading"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            :filters="filters"
            :search-query="searchQuery"
            :search-placeholder="'Search by kid\'s name or code...'"
            @update:sort-by="handleSortBy"
            @update:sort-direction="handleSortDirection"
            @update:current-page="handlePageChange"
            @update:filters="handleFilter"
            @update:search-query="handleSearch"
            @update:enterKey="handleEnterKey"
            @action="handleAction"
            @select-change="handleSelectChange"
          />
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import DatePicker from '../components/shared/datePicker.vue'
import DataTable from '../components/shared/DataTable.vue'
import type { Column } from '../interfaces/column'
import { dataService } from '../services/dataContext';

// Types
interface Kid {
  code: string
  name: string
  isAdded: boolean
  date: string
}

// Reactive data
const dateType = ref<'single' | 'range'>('single')
const singleDate = ref<Date | undefined>(undefined)
const startDate = ref<Date | undefined>(undefined)
const endDate = ref<Date | undefined>(undefined)
const isLoading = ref(false)
const isExporting = ref(false)
const kids = ref<Kid[]>([])

// DataTable props
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = computed(() => filteredData.value.length)
const sortBy = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const filters = ref<Record<string, any>>({})
const searchQuery = ref('')

// Table columns configuration
const tableColumns: Column[] = [
  {
    key: 'code',
    label: 'Code',
    type: 'code',
    sortable: true,
    align: 'left'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    sortable: true,
    align: 'right'
  },
  {
    key: 'isAdded',
    label: 'Status',
    type: 'attendance-status',
    sortable: true,
    align: 'center'
  },
]

// Dynamic table columns based on date type and data
const dynamicTableColumns = computed(() => {
  if (dateType.value === 'single') {
    return tableColumns;
  } else {
    // For date range, create dynamic columns
    const baseColumns: Column[] = [
      {
        key: 'code',
        label: 'Code',
        type: 'code',
        sortable: true,
        align: 'left'
      },
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        sortable: true,
        align: 'right'
      }
    ];

    // Add date columns if we have data
    if (kids.value.length > 0) {
      const firstKid = kids.value[0];
      const dateKeys = Object.keys(firstKid).filter(key => 
        key !== 'code' && key !== 'name' && key !== 'id'
      );

      dateKeys.forEach(dateKey => {
        baseColumns.push({
          key: dateKey,
          label: dateKey,
          type: 'attendance-status',
          sortable: true,
          align: 'center'
        });
      });
    }

    return baseColumns;
  }
});

// Computed properties
const filteredData = computed(() => {
  let result = [...kids.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((item: any) => {
      const codeMatch = item.code.toString().includes(searchQuery.value);
      const fullName = item.name.toLowerCase();
      const fullNameMatch = fullName.includes(query);
      return codeMatch || fullNameMatch;
    });
  }

  // Apply sorting
  if (sortBy.value) {
    result.sort((a: any, b: any) => {
      let aValue = a[sortBy.value];
      let bValue = b[sortBy.value];

      // Handle code field specifically since it's a number
      if (sortBy.value === 'code') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy.value === 'name') {
        // For name field, convert to lowercase for case-insensitive sorting
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      } else {
        // For date columns (attendance status), treat as boolean
        aValue = Boolean(aValue);
        bValue = Boolean(bValue);
      }

      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
});

const presentCount = computed(() => {
  if (dateType.value === 'single') {
    return kids.value.filter(kid => kid.isAdded).length;
  } else {
    // For date range, count total present across all dates
    return kids.value.reduce((total: any, kid: any) => {
      const presentDays = Object.keys(kid).filter((key: any) => 
        key !== 'code' && key !== 'name' && key !== 'id' && kid[key] === true
      ).length;
      return total + presentDays;
    }, 0);
  }
});

const absentCount = computed(() => {
  if (dateType.value === 'single') {
    return kids.value.filter(kid => !kid.isAdded).length;
  } else {
    // For date range, count total absent across all dates
    return kids.value.reduce((total: any, kid: any) => {
      const absentDays = Object.keys(kid).filter((key: any) => 
        key !== 'code' && key !== 'name' && key !== 'id' && kid[key] === false
      ).length;
      return total + absentDays;
    }, 0);
  }
});

const attendanceRate = computed(() => {
  if (kids.value.length === 0) return 0;
  
  if (dateType.value === 'single') {
    return Math.round((presentCount.value / kids.value.length) * 100);
  } else {
    // For date range, calculate rate based on total possible attendance
    const totalPossibleAttendance = kids.value.reduce((total, kid) => {
      const dateKeys = Object.keys(kid).filter(key => 
        key !== 'code' && key !== 'name' && key !== 'id'
      );
      return total + dateKeys.length;
    }, 0);
    
    return totalPossibleAttendance > 0 ? Math.round((presentCount.value / totalPossibleAttendance) * 100) : 0;
  }
});

// Methods
const resetDates = () => {
  singleDate.value = undefined
  startDate.value = undefined
  endDate.value = undefined
  kids.value = []
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadAttendanceData = async () => {
  if (!hasValidDateSelection()) return
  
  isLoading.value = true
  
  try {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - replace with actual API response
    const mockKids: Kid[] = [
      { code: 'K001', name: 'Ahmed Ali', isAdded: true, date: getSelectedDate() },
      { code: 'K002', name: 'Fatima Hassan', isAdded: false, date: getSelectedDate() },
      { code: 'K003', name: 'Omar Khalil', isAdded: true, date: getSelectedDate() },
      { code: 'K004', name: 'Aisha Rahman', isAdded: true, date: getSelectedDate() },
      { code: 'K005', name: 'Yusuf Ibrahim', isAdded: false, date: getSelectedDate() },
      { code: 'K006', name: 'Zara Ahmed', isAdded: true, date: getSelectedDate() },
      { code: 'K007', name: 'Hassan Mohamed', isAdded: true, date: getSelectedDate() },
      { code: 'K008', name: 'Layla Omar', isAdded: false, date: getSelectedDate() },
    ]
    
    // Transform data for DataTable
    kids.value = mockKids.map(kid => ({
      ...kid,
      status: kid.isAdded ? 'Present' : 'Absent'
    }))
  } catch (error) {
    console.error('Error loading attendance data:', error)
    // Handle error - show notification
  } finally {
    isLoading.value = false
  }
}
const getKidsData = async (localDateType: 'single' | 'start' | 'end') => {
    try {
        if(localDateType === 'single'){
            dateType.value = 'single'
        }else if(localDateType === 'start' || localDateType === 'end'){
            dateType.value = 'range'
        }
        const today = new Date();
        let endpoint = '';

        if (localDateType === 'single') {
            const date = singleDate.value ?? today;
            const formattedDate = date.toLocaleDateString('en-CA');
            endpoint = `/api/TestKidsAtt/GetKidsData?SpecificDate=${formattedDate}`;
        } else if (localDateType === 'start') {
            const start = startDate.value ?? today;
            const end = endDate.value ?? today;
            const formattedStart = start.toLocaleDateString('en-CA');
            const formattedEnd = end.toLocaleDateString('en-CA');
            endpoint = `/api/TestKidsAtt/GetKidsDataByDateRange?StartDate=${formattedStart}&EndDate=${formattedEnd}`;
        } else if (localDateType === 'end') {
            const start = startDate.value ?? today;
            const end = endDate.value ?? today;
            const formattedStart = start.toLocaleDateString('en-CA');
            const formattedEnd = end.toLocaleDateString('en-CA');
            endpoint = `/api/TestKidsAtt/GetKidsDataByDateRange?StartDate=${formattedStart}&EndDate=${formattedEnd}`;
        }

        console.log('Endpoint:', endpoint);

        const result: any = await dataService.fetchOnline(endpoint);
        console.log('Result:', result);

        if (result.httpStatus === 200 || result.status) {
            if(dateType.value === 'single'){
                kids.value = result.data.kids ? result.data.kids : result.data;
            }else if(dateType.value === 'range'){
                handleDateRangeData(result.data);
            }
        }
    } catch (error) {
        console.error('Error fetching kids data:', error);
    }
};

const handleDateRangeData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
        kids.value = [];
        return;
    }

    // Get all unique kids from all dates
    const allKidsMap = new Map();
    
    data.forEach(dateObj => {
        if (dateObj.kids && Array.isArray(dateObj.kids)) {
            dateObj.kids.forEach((kid: any) => {
                if (!allKidsMap.has(kid.code)) {
                    allKidsMap.set(kid.code, {
                        code: kid.code,
                        name: kid.name,
                        id: kid.id
                    });
                }
            });
        }
    });

    // Convert map to array and add attendance data for each date
    const processedKids = Array.from(allKidsMap.values()).map(kid => {
        const kidData: any = {
            code: kid.code,
            name: kid.name,
            id: kid.id
        };

        // Add attendance status for each date
        data.forEach(dateObj => {
            const dateKey = formatDateForColumn(dateObj.date);
            const kidInDate = dateObj.kids?.find((k: any) => k.code === kid.code);
            kidData[dateKey] = kidInDate ? kidInDate.isAdded : false;
        });

        return kidData;
    });

    kids.value = processedKids;
};

const formatDateForColumn = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const hasValidDateSelection = (): boolean => {
  if (dateType.value === 'single') {
    return singleDate.value !== undefined
  } else {
    return startDate.value !== undefined && endDate.value !== undefined
  }
}

const getSelectedDate = (): string => {
  if (dateType.value === 'single' && singleDate.value) {
    return singleDate.value.toISOString().split('T')[0]
  }
  // For range, return start date for demo
  return startDate.value?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
}

const exportAttendance = async () => {
  if (!hasValidDateSelection()) {
    // Show error message
    return
  }
  
  isExporting.value = true
  
  try {
    // Simulate API call - replace with actual export API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock export success
    console.log('Exporting attendance data...')
    // Handle successful export - show notification
    
  } catch (error) {
    console.error('Error exporting attendance:', error)
    // Handle error - show notification
  } finally {
    isExporting.value = false
  }
}

// DataTable event handlers
const handleSortBy = (newSortBy: string) => {
  sortBy.value = newSortBy;
};

const handleSortDirection = (newSortDirection: 'asc' | 'desc') => {
  sortDirection.value = newSortDirection;
};

const handleFilter = (newFilters: any) => {
  filters.value = newFilters;
};

const handleSearch = (query: string) => {
  searchQuery.value = query;
};

const handleEnterKey = (value: boolean) => {
  console.log('Enter key:', value);
//   if(value && filteredData.value.length == 1){
//     handleCheckboxChange({
//       column: 'isAdded',
//       value: !filteredData.value[0].isAdded,
//       row: filteredData.value[0]
//     })
//   }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleAction = (payload: { action: string; row: any }) => {
  console.log('Action:', payload.action, 'Row:', payload.row);
};

const handleSelectChange = (payload: { column: string; value: any; row: any }) => {
  console.log('Select change:', payload);
};

// Watchers
watch([singleDate, startDate, endDate], () => {
  if (hasValidDateSelection()) {
    // getKidsData()
  }
})

// Lifecycle
onMounted(() => {
  // Set default date to today
  singleDate.value = new Date()
  getKidsData('single')
})
</script>

<style scoped>
.attendance-history {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: 2rem;
  background-color: #f8fafc; */
  min-height: 100vh;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
}
.filters-section{
    margin-bottom: 2rem;
}
.action-buttons {
  display: flex;
  gap: 1rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}



.filter-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.filter-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.filter-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-content {
  padding: 2rem;
}

/* .filter-row {
  margin-bottom: 2rem;
} */

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

/* Radio Group */
.radio-group {
  display: flex;
  gap: 2rem;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #4b5563;
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.radio-item input[type="radio"]:checked + .radio-custom {
  border-color: #4f46e5;
  background: #4f46e5;
}

.radio-item input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

/* Date Pickers */
.date-pickers-container {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
}

.date-range-container {
  display: flex;
  gap: 2rem;
  width: 100%;
}

.date-picker-wrapper {
  flex: 1;
}

/* Refresh Container */
.refresh-container {
  display: flex;
  justify-content: flex-end;
}

/* Data Section */
.data-section {
  margin-bottom: 2rem;
}

.data-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  max-width: 400px;
}

/* Table Container */
.table-container {
    padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.record-count {
  font-size: 0.9rem;
  font-weight: 400;
  color: #6b7280;
}

/* Summary Section */
.summary-section {
  margin-top: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.present-card .summary-icon {
  background: #dcfce7;
  color: #166534;
}

.absent-card .summary-icon {
  background: #fee2e2;
  color: #991b1b;
}

.total-card .summary-icon {
  background: #dbeafe;
  color: #1d4ed8;
}

.attendance-rate-card .summary-icon {
  background: #fef3c7;
  color: #92400e;
}

.summary-content {
  flex: 1;
}

.summary-title {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .attendance-history {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .date-pickers-container,
  .date-range-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 1rem;
  }
  
  .refresh-container {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .summary-card {
    padding: 1.5rem;
  }
  
  .summary-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .summary-value {
    font-size: 1.5rem;
  }
}
</style>
