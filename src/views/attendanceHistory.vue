<template>
  <div class="attendance-history container-fluid">

    <!-- Filters Section -->
    <div class="filters-section mb-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <!-- Date Range Type Selection -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="filter-group">
              <label class="form-label fw-semibold text-secondary mb-2">Date Range Type</label>
              <div class="d-flex gap-4">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="singleDate"
                    v-model="dateType" 
                    value="single"
                    @change="resetDates"
                  />
                  <label class="form-check-label" for="singleDate">
                    Single Date
                  </label>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    id="dateRange"
                    v-model="dateType" 
                    value="range"
                    @change="resetDates"
                  />
                  <label class="form-check-label" for="dateRange">
                    Date Range
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Refresh Button -->
            <div class="refresh-container">
              <!-- <button 
                class="btn btn-outline-secondary d-flex align-items-center gap-2"
                @click="() => getKidsData(dateType)"
                :disabled="isLoading"
              >
                <i class="fa-solid fa-rotate"></i>
                {{ isLoading ? 'Loading...' : 'Refresh Data' }}
              </button> -->
            </div>
          </div>

          <!-- Date Pickers -->
          <div class="row">
            <div class="col-12">
              <div class="d-flex gap-4">
                <!-- Single Date -->
                <div v-if="dateType === 'single'" class="flex-fill">
                  <DatePicker
                    id="single-date"
                    v-model="singleDate"
                    label="Select Date"
                    placeholder="Choose a date"
                    @update:modelValue="() => getKidsData('single')"
                  />
                </div>
                
                <!-- Date Range -->
                <div v-if="dateType === 'range'" class="d-flex gap-4 w-100">
                  <div class="flex-fill">
                    <DatePicker
                      id="start-date"
                      v-model="startDate"
                      label="Start Date"
                      placeholder="Start date"
                      :max-date="startDateMaxDate"
                      @update:modelValue="() => getKidsData('start')"
                    />
                  </div>
                  <div class="flex-fill">
                    <DatePicker
                      id="end-date"
                      v-model="endDate"
                      label="End Date"
                      placeholder="End date"
                      :min-date="endDateMinDate"
                      @update:modelValue="() => getKidsData('end')"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Date Range Validation Error -->
              <div v-if="dateType === 'range' && dateValidationError" class="mt-3">
                <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
                  <i class="fa-solid fa-exclamation-triangle"></i>
                  <span>{{ dateValidationError }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-if="kids.length > 0" class="summary-section mb-4">
      <div class="row g-3">
        <div class="col-lg-3 col-md-6">
          <div class="card shadow-sm h-100 present-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="summary-icon">
                <i class="fa-solid fa-check-circle"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted text-uppercase fw-semibold small">Present</h6>
                <h3 class="card-title mb-0 fw-bold text-dark">{{ presentCount }}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6">
          <div class="card shadow-sm h-100 absent-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="summary-icon">
                <i class="fa-solid fa-times-circle"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted text-uppercase fw-semibold small">Absent</h6>
                <h3 class="card-title mb-0 fw-bold text-dark">{{ absentCount }}</h3>
              </div>
            </div>
          </div>  
        </div>
        
        <div class="col-lg-3 col-md-6">
          <div class="card shadow-sm h-100 total-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="summary-icon">
                <i class="fa-solid fa-users"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted text-uppercase fw-semibold small">Total</h6>
                <h3 class="card-title mb-0 fw-bold text-dark">{{ kids.length }}</h3>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-3 col-md-6">
          <div class="card shadow-sm h-100 attendance-rate-card">
            <div class="card-body d-flex align-items-center gap-3">
              <div class="summary-icon">
                <i class="fa-solid fa-percentage"></i>
              </div>
              <div class="flex-grow-1">
                <h6 class="card-subtitle mb-1 text-muted text-uppercase fw-semibold small">Rate</h6>
                <h3 class="card-title mb-0 fw-bold text-dark">{{ attendanceRate }}%</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Data Section -->
    <div class="data-section no-background">
      <div class="  no-background">
        <!-- Loading State -->
        <div v-if="isLoading && kids.length === 0" class="card-body d-flex flex-column align-items-center justify-content-center py-5">
          <div class="loading-spinner mb-3"></div>
          <p class="text-muted mb-0">Loading attendance data...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="kids.length === 0" class="card-body d-flex flex-column align-items-center justify-content-center py-5 text-center">
          <div class="empty-icon mb-3">
            <i class="fa-solid fa-calendar-xmark"></i>
          </div>
          <h4 class="fw-semibold text-secondary mb-2">No Attendance Data</h4>
          <p v-if="!isDateRangeEmpty" class="text-muted mb-0">
            Select a date or date range to view attendance data.
          </p>
          <p v-else class="text-muted mb-0">
            No attendance data found for the selected date range.
          </p>
        </div>

        <!-- DataTable -->
        <div v-else class="card-body no-background ">
          <DataTable
            :customButtons="tableButtons"
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
            @update:search-query="handleSearch"
            @update:enterKey="handleEnterKey"
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
import { authService } from '../services/authService';
import type { CustomButton } from '../interfaces/customButtons';
import { createButtonsWithPermissions } from '../utils/simplePermissions';

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
const isDateRangeEmpty = ref(false)
const isExporting = ref(false)
const kids = ref<Kid[]>([])

// Date validation state
const dateValidationError = ref<string>('')
const isDateRangeValid = ref(true)

// DataTable props
const sortBy = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')
const filters = ref<Record<string, any>>({})
const searchQuery = ref('')

// Custom buttons
const tableButtons = computed(() => {
  // Only add "Export Data" button if user has permission
  return createButtonsWithPermissions([
    {
      id: 'export-attendance',
      permission: 'Export attendance',
      config: {
        label: 'Export Attendance',
        icon: 'fa-download',
        variant: 'btn-primary'
      }
    }
  ]);
});

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
        align: 'right',
        isMainColumn: true
      }
    ];

    // Add date columns if we have data
    if (kids.value.length > 0) {
      const firstKid = kids.value[0];
      const dateKeys = Object.keys(firstKid).filter(key => 
        key !== 'code' && key !== 'name' && key !== 'id' && key !== 'percentage'
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

      // Add percentage column as the last column
      baseColumns.push({
        key: 'percentage',
        label: 'Attendance %',
        type: 'percentage',
        sortable: true,
        align: 'center'
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
      } else if (sortBy.value === 'percentage') {
        // For percentage field, treat as number
        aValue = Number(aValue);
        bValue = Number(bValue);
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

// Date validation computed properties
const validateDateRange = computed(() => {
  if (dateType.value !== 'range') {
    dateValidationError.value = ''
    isDateRangeValid.value = true
    return true
  }

  if (!startDate.value || !endDate.value) {
    dateValidationError.value = ''
    isDateRangeValid.value = true
    return true
  }

  if (endDate.value < startDate.value) {
    dateValidationError.value = 'End date cannot be before start date'
    isDateRangeValid.value = false
    return false
  }

  dateValidationError.value = ''
  isDateRangeValid.value = true
  return true
})

const endDateMinDate = computed(() => {
  return startDate.value || undefined
})

const startDateMaxDate = computed(() => {
  return endDate.value || undefined
})

// Methods  
const resetDates = () => {
  singleDate.value = undefined
  startDate.value = undefined
  endDate.value = undefined
  kids.value = []
  dateValidationError.value = ''
  isDateRangeValid.value = true
}

const getKidsData = async (localDateType: 'single' | 'start' | 'end') => {
    try {
        if(localDateType === 'single'){
            dateType.value = 'single'
        }else if(localDateType === 'start' || localDateType === 'end'){
            dateType.value = 'range'
        }

        // Check date range validation for range type
        if (dateType.value === 'range' && !validateDateRange.value) {
            return // Don't proceed if validation fails
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

        const result: any = await dataService.fetchOnline(endpoint);

        if (result.httpStatus === 200 || result.status) {
            if(dateType.value === 'single'){
                kids.value = result.data.kids ? result.data.kids : result.data;
            }else if(dateType.value === 'range'){
                isDateRangeEmpty.value = result.data.dailyAttendance.length === 0;
                handleDateRangeData(result.data.dailyAttendance, result.data.attendancePercentages);
            }
        }
    } catch (error) {
        console.error('Error fetching kids data:', error);
    }
};

const handleDateRangeData = (data: any[], attendancePercentages: any[]) => {
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

        // Add percentage from attendancePercentages array
        const percentageData = attendancePercentages?.find((p: any) => p.code === kid.code);
        kidData.percentage = percentageData ? percentageData.percentage : 0;

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
    return startDate.value !== undefined && endDate.value !== undefined && isDateRangeValid.value
  }
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

// Watchers
watch([singleDate, startDate, endDate], () => {
  if (hasValidDateSelection()) {
    // getKidsData()
  }
})

// Watch for date range validation
watch([startDate, endDate], () => {
  if (dateType.value === 'range') {
    validateDateRange.value // Trigger validation
  }
})

// Watch for date type changes to reset validation
watch(dateType, () => {
  dateValidationError.value = ''
  isDateRangeValid.value = true
})

// Lifecycle
onMounted(() => {
  // Set default date to today
  singleDate.value = new Date()
  getKidsData('single')
})
</script>

<style scoped>
.no-background{
  background-color: transparent !important;
}
.filters-section{
  margin-bottom: 2rem;
}
.summary-section{
  margin-bottom: 2rem;
}
.container-fluid{
  max-width: 1200px;
  /* margin: 0 auto; */
}
.card{
  border : none !important;
}
.attendance-history {
  min-height: 100vh;
}

/* Custom styles for summary icons */
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

/* Loading spinner animation */
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state icon */
.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
}

/* Hover effects for summary cards */
.present-card:hover,
.absent-card:hover,
.total-card:hover,
.attendance-rate-card:hover {
  transform: translateY(-4px);
  transition: transform 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .summary-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}

/* Date validation error styling */
.alert-danger {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.alert-danger i {
  color: #dc2626;
}
.form-check{
  cursor: pointer !important;
}
</style>
