<template>
  <div class="attendance-history container-fluid">

    <!-- Filters Section -->
    <div class="filters-section mb-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <!-- Date Range Type Selection -->
          <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <div class="filter-group">
              <label class="form-label fw-semibold text-secondary mb-2">{{ t('attendanceHistory.dateRangeType')
                }}</label>
              <div class="d-flex gap-4">
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="singleDate" v-model="dateType" value="single"
                    @change="resetDates" />
                  <label class="form-check-label" for="singleDate">
                    {{ t('attendanceHistory.singleDate') }}
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="dateRange" v-model="dateType" value="range"
                    @change="resetDates" />
                  <label class="form-check-label" for="dateRange">
                    {{ t('attendanceHistory.dateRange') }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Place summary row here -->
            <div v-if="kids.length > 0" class="d-flex flex-wrap gap-2 align-items-center ms-auto px-2 py-1 rounded-3"
              style="background: #f8fafc; font-size: 0.95rem;">
              <span
                class="d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-success bg-opacity-10 text-success fw-semibold">
                <i class="fa-solid fa-check-circle"></i> {{ presentCount }} <span class="d-none d-md-inline">{{
                  t('attendanceHistory.present') }}</span>
              </span>
              <span
                class="d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-danger bg-opacity-10 text-danger fw-semibold">
                <i class="fa-solid fa-times-circle"></i> {{ absentCount }} <span class="d-none d-md-inline">{{
                  t('attendanceHistory.absent') }}</span>
              </span>
              <span
                class="d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-primary bg-opacity-10 text-primary fw-semibold">
                <i class="fa-solid fa-users"></i> {{ kids.length }} <span class="d-none d-md-inline">{{
                  t('attendanceHistory.total') }}</span>
              </span>
              <span
                class="d-flex align-items-center gap-1 px-2 py-1 rounded-pill bg-warning bg-opacity-10 text-warning fw-semibold">
                <i class="fa-solid fa-percentage"></i> {{ attendanceRate }}% <span class="d-none d-md-inline">{{
                  t('attendanceHistory.rate') }}</span>
              </span>
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
                  <DatePicker id="single-date" v-model="singleDate" :label="t('attendanceHistory.selectDate')"
                    :placeholder="t('attendanceHistory.chooseDate')" @update:modelValue="() => getKidsData('single')" />
                </div>

                <!-- Date Range -->
                <div v-if="dateType === 'range'" class="d-flex gap-4 w-100">
                  <div class="flex-fill">
                    <DatePicker id="start-date" v-model="startDate" :label="t('attendanceHistory.startDate')"
                      :placeholder="t('attendanceHistory.startDatePlaceholder')" :max-date="startDateMaxDate"
                      @update:modelValue="() => getKidsData('start')" />
                  </div>
                  <div class="flex-fill">
                    <DatePicker id="end-date" v-model="endDate" :label="t('attendanceHistory.endDate')"
                      :placeholder="t('attendanceHistory.endDatePlaceholder')" :min-date="endDateMinDate"
                      @update:modelValue="() => getKidsData('end')" />
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



    <!-- Attendance Data Section -->
    <div class="data-section no-background">
      <div class="  no-background">
        <!-- Loading State -->
        <div v-if="isLoading && kids.length === 0"
          class="card-body d-flex flex-column align-items-center justify-content-center py-5">
          <div class="loading-spinner mb-3"></div>
          <p class="text-muted mb-0">{{ t('attendanceHistory.loadingData') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="kids.length === 0"
          class="card-body d-flex flex-column align-items-center justify-content-center py-5 text-center">
          <div class="empty-icon mb-3">
            <i class="fa-solid fa-calendar-xmark"></i>
          </div>
          <h4 class="fw-semibold text-secondary mb-2">{{ t('attendanceHistory.noAttendanceData') }}</h4>
          <p v-if="!isDateRangeEmpty" class="text-muted mb-0">
            {{ t('attendanceHistory.selectDateOrRange') }}
          </p>
          <p v-else class="text-muted mb-0">
            {{ t('attendanceHistory.noAttendanceDataRange') }}
          </p>
        </div>

        <!-- DataTable -->
        <div v-else class="card-body no-background ">
          <DataTable :customButtons="tableButtons" :columns="dynamicTableColumns" :data="filteredData"
            :loading="isLoading" :sort-by="sortBy" :sort-direction="sortDirection" :filters="filters"
            :search-query="searchQuery" :search-placeholder="t('attendanceHistory.searchPlaceholder')"
            @update:sort-by="handleSortBy" @update:sort-direction="handleSortDirection"
            @update:search-query="handleSearch" @buttonClick="handleButtonClick" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DatePicker from '../components/shared/datePicker.vue'
import DataTable from '../components/shared/DataTable.vue'
import type { Column } from '../interfaces/column'
import { dataService } from '../services/dataContext';
import { createButtonsWithPermissions } from '../utils/simplePermissions';

const { t } = useI18n();

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
        label: isExporting.value ? t('attendanceHistory.exporting') : t('attendanceHistory.exportAttendance'),
        icon: isExporting.value ? 'fa-spinner fa-spin' : 'fa-download',
        variant: 'btn-primary',
        // onClick: exportAttendance,
        disabled: isExporting.value || !hasValidDateSelection()
      }
    }
  ]);
});

// Table columns configuration
const tableColumns: Column[] = [
  {
    key: 'code',
    label: t('attendanceHistory.columns.code'),
    type: 'code',
    sortable: true,
    align: 'left'
  },
  {
    key: 'name',
    label: t('attendanceHistory.columns.name'),
    type: 'text',
    sortable: true,
    align: 'right'
  },
  {
    key: 'gradeName',
    label: t('attendanceHistory.columns.grade'),
    type: 'grade-chip',
    sortable: false,
    align: 'center',
    filterable: true,
    filterType: 'select',
    isMainColumn: false
  },
  {
    key: 'className',
    label: t('attendanceHistory.columns.class'),
    type: 'text',
    sortable: false,
    align: 'center',
    isMainColumn: false
  },
  {
    key: 'isAdded',
    label: t('attendanceHistory.columns.status'),
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
        label: t('attendanceHistory.columns.code'),
        type: 'code',
        sortable: true,
        align: 'left'
      },
      {
        key: 'name',
        label: t('attendanceHistory.columns.name'),
        type: 'text',
        sortable: true,
        align: 'right',
        isMainColumn: true
      },
      {
        key: 'gradeName',
        label: t('attendanceHistory.columns.grade'),
        type: 'grade-chip',
        sortable: false,
        align: 'center',
        isMainColumn: false
      },
      {
        key: 'className',
        label: t('attendanceHistory.columns.class'),
        type: 'text',
        sortable: false,
        align: 'left',
        isMainColumn: false
      },

    ];

    // Add date columns if we have data
    if (kids.value.length > 0) {
      const firstKid = kids.value[0];
      const dateKeys = Object.keys(firstKid).filter(key =>
        key !== 'code' && key !== 'name' && key !== 'id' && key !== 'percentage' && key !== 'gradeName' && key !== 'className'
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
        label: t('attendanceHistory.columns.attendancePercentage'),
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
    dateValidationError.value = t('attendanceHistory.errors.endDateBeforeStart')
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
    if (localDateType === 'single') {
      dateType.value = 'single'
    } else if (localDateType === 'start' || localDateType === 'end') {
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
      if (dateType.value === 'single') {
        kids.value = result.data.kids ? result.data.kids : result.data;
      } else if (dateType.value === 'range') {
        isDateRangeEmpty.value = result.data.dailyAttendance.length === 0;
        handleDateRangeData(result.data.dailyAttendance, result.data.attendancePercentages);
      }
    }
  } catch (error) {
    console.error(t('attendanceHistory.errors.fetchDataError'), error);
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
            id: kid.id,
            gradeName: kid.gradeName,
            className: kid.className
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
      id: kid.id,
      gradeName: kid.gradeName,
      className: kid.className
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
  console.log(kids.value);
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


const handleButtonClick = async () => {
  if (!hasValidDateSelection()) {
    // Show error message
    return
  }

  isExporting.value = true

  try {
    const today = new Date();
    let endpoint = '';
    let filename = '';

    if (dateType.value === 'single') {
      const date = singleDate.value ?? today;
      const formattedDate = date.toLocaleDateString('en-CA');
      endpoint = `/api/TestKidsAtt/ExportKidsData?SpecificDate=${formattedDate}`;
      filename = `attendance_${formattedDate}.xlsx`;
    } else if (dateType.value === 'range') {
      const start = startDate.value ?? today;
      const end = endDate.value ?? today;
      const formattedStart = start.toLocaleDateString('en-CA');
      const formattedEnd = end.toLocaleDateString('en-CA');
      endpoint = `/api/TestKidsAtt/ExportKidsDataByDateRange?startDate=${formattedStart}&endDate=${formattedEnd}`;
      filename = `attendance_${formattedStart}_to_${formattedEnd}.xlsx`;
    }

    // Use the new downloadFile method
    await dataService.downloadFile(endpoint, filename);

  } catch (error) {
    console.error('Error exporting attendance:', error);
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
.no-background {
  background-color: transparent !important;
}

.filters-section {
  margin-bottom: 2rem;
}

.summary-section {
  margin-bottom: 2rem;
}

.container-fluid {
  max-width: 1200px;
  /* margin: 0 auto; */
}

.card {
  border: none !important;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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

.form-check {
  cursor: pointer !important;
}
</style>
