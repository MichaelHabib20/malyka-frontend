<script setup lang="ts">
import { dataService } from '../services/dataContext';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';
import DataTable from '../components/shared/DataTable.vue';
import DatePicker from '../components/shared/datePicker.vue';
import type { Column } from '../interfaces/column';
import { statusService } from '../services/statusService';
import { offlineStore } from '../services/offlineStore';

// Sample data
const tableData : any = ref([]);

// Define columns
const columns: Column[] = [
  {     
    key: 'code', 
    label: 'code', 
    type: 'code',
    sortable: true 
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
    label: 'Attendance', 
    type: 'checkbox',
    sortable: false
  },
];

// State management
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(tableData.value.length);
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');
const filters = ref({});
const searchQuery = ref('');
const selectedDate = ref(new Date());
const isOnline = ref(statusService.isOnline());
const endpointWithParams = ref('');
// Computed property to filter and sort data
const filteredData = computed(() => {
  let result = [...tableData.value];

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
      } else {
        // For name field, convert to lowercase for case-insensitive sorting
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
});

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Event handlers
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

const handleCheckboxChange = async (payload: { column: string; value: boolean; row: any }) => {
    const date = selectedDate.value;
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
    const modal = {
        kidId: payload.row.id,
        isAdded: payload.value,
        attendanceDate: formattedDate
    }
    const result : any = await dataService.post('/api/TestKidsAtt/PostKidAtt', modal)

  // handle update cached data
  if(!isOnline.value){
    await handleUpdateCachedData(modal)
  }
};
const handleUpdateCachedData = async (modal: any) => {
    tableData.value.map((item: any) => {
        if(item.id === modal.kidId){
            item.isAdded = modal.isAdded;
        }
    })
  const cacheKey = endpointWithParams.value;
  // Parse and stringify to ensure we have a clean copy
  const updatedData = JSON.parse(JSON.stringify(tableData.value));
  await offlineStore.saveData(cacheKey, updatedData);

}
const handleDateChange = async (date: Date) => {
        selectedDate.value = date;
        await getKidsData();
    
};

const getKidsData = async () => {
    try { 
        const formattedDate = selectedDate.value.toLocaleDateString('en-CA');
        endpointWithParams.value = `/api/TestKidsAtt/GetKidsData?SpecificDate=${formattedDate}`;
        const result : any = await dataService.get(endpointWithParams.value)
        if(result.httpStatus === 200 || result.status){
            tableData.value = result.data.kids ? result.data.kids : result.data
        }
    } catch (error) {
        console.error('Error fetching kids data:', error)
    }
}

onMounted(async () => {
    await getKidsData()
    statusService.subscribe((status) => {
    isOnline.value = status;
  });
})
</script>

<template>
  <div class="attendance-container">
    <div class="date-section">
      <div class="date-info">
        <h2>Taking Attendance for</h2>
        <div class="date-display">{{ formattedDate }}</div>
      </div>
      <div class="date-picker">
        <DatePicker
          v-model="selectedDate"
          id="attendance-date"
          label="Change Date"
          :validation-rules="[]"
          :isNeedNetwork="true"
          @update:modelValue="handleDateChange"
        />
      </div>
    </div>

    <div class="table-section">
      <DataTable
        :columns="columns"
        :data="filteredData"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :current-page="currentPage"
        :sort-by="sortBy"
        :sort-direction="sortDirection"
        :filters="filters"
        :search-query="searchQuery"
        :search-placeholder="'Search by kid\'s name or code...'"
        @update:sort-by="handleSortBy"
        @update:sort-direction="handleSortDirection"
        @update:search-query="handleSearch"
        @update:enterKey="handleEnterKey"
        @checkbox-change="handleCheckboxChange"
      />
    </div>
  </div>
</template>

<style scoped>
.attendance-container {
  max-width: 1200px;
  margin: 0 auto;
}

.date-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.date-info {
  flex: 1;
  min-width: 300px;
}

.date-info h2 {
  color: #4a5568;
  font-size: 1.25rem;
  margin: 0;
  margin-bottom: 0.5rem;
}

.date-display {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 250px;
}

.date-picker label {
  color: #4a5568;
  font-weight: 500;
}

.date-input {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  color: #2d3748;
  background-color: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-input:hover {
  border-color: #cbd5e0;
}

.date-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.table-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>