<template>
  <div class="card-body container">
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="'Search by name, code, or phone'"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      @update:sort-by="handleSortBy"
      @update:sort-direction="handleSortDirection"
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
import type { Student } from '../interfaces/student';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';

const router = useRouter();

// Static student data
const staticStudents: Student[] = [
  {
    id: 1,
    code: 'ST001',
    class: { id: 1, name: 'Class A', description: 'Primary Class A' },
    name: 'Ahmed Mohamed Ali',
    number: '1',
    subStreet: 'Al-Nasr Street',
    mainStreet: 'Main Street',
    area: 'Downtown',
    floor: '2nd Floor',
    apartment: 'Apt 5',
    notes: 'Excellent student',
    homePhone: '02-1234567',
    motherMobile: '010-12345678',
    fatherMobile: '011-12345678',
    birthDate: '2015-03-15',
    age: 8,
    siblings: true,
    gender: 'Male',
    nationalId: '12345678901234',
    grade: { id: 1, name: 'Grade 1', description: 'First Grade' }
  },
  {
    id: 2,
    code: 'ST002',
    class: { id: 1, name: 'Class A', description: 'Primary Class A' },
    name: 'Fatima Hassan',
    number: '2',
    subStreet: 'Al-Salam Street',
    mainStreet: 'Peace Street',
    area: 'Uptown',
    floor: '1st Floor',
    apartment: 'Apt 12',
    notes: 'Needs attention in math',
    homePhone: '02-2345678',
    motherMobile: '010-23456789',
    fatherMobile: '011-23456789',
    birthDate: '2015-07-22',
    age: 8,
    siblings: false,
    gender: 'Female',
    nationalId: '23456789012345',
    grade: { id: 1, name: 'Grade 1', description: 'First Grade' }
  },
  {
    id: 3,
    code: 'ST003',
    class: { id: 2, name: 'Class B', description: 'Primary Class B' },
    name: 'Omar Khalil',
    number: '3',
    subStreet: 'Al-Amal Street',
    mainStreet: 'Hope Street',
    area: 'Suburbs',
    floor: '3rd Floor',
    apartment: 'Apt 8',
    notes: 'Very active student',
    homePhone: '02-3456789',
    motherMobile: '010-34567890',
    fatherMobile: '011-34567890',
    birthDate: '2014-11-10',
    age: 9,
    siblings: true,
    gender: 'Male',
    nationalId: '34567890123456',
    grade: { id: 2, name: 'Grade 2', description: 'Second Grade' }
  },
  {
    id: 4,
    code: 'ST004',
    class: { id: 2, name: 'Class B', description: 'Primary Class B' },
    name: 'Aisha Mahmoud',
    number: '4',
    subStreet: 'Al-Noor Street',
    mainStreet: 'Light Street',
    area: 'City Center',
    floor: 'Ground Floor',
    apartment: 'Apt 3',
    notes: 'Top performer',
    homePhone: '02-4567890',
    motherMobile: '010-45678901',
    fatherMobile: '011-45678901',
    birthDate: '2014-05-18',
    age: 9,
    siblings: true,
    gender: 'Female',
    nationalId: '45678901234567',
    grade: { id: 2, name: 'Grade 2', description: 'Second Grade' }
  },
  {
    id: 5,
    code: 'ST005',
    class: { id: 3, name: 'Class C', description: 'Primary Class C' },
    name: 'Youssef Ibrahim',
    number: '5',
    subStreet: 'Al-Falah Street',
    mainStreet: 'Success Street',
    area: 'New District',
    floor: '4th Floor',
    apartment: 'Apt 15',
    notes: 'Good behavior',
    homePhone: '02-5678901',
    motherMobile: '010-56789012',
    fatherMobile: '011-56789012',
    birthDate: '2013-09-25',
    age: 10,
    siblings: false,
    gender: 'Male',
    nationalId: '56789012345678',
    grade: { id: 3, name: 'Grade 3', description: 'Third Grade' }
  }
];

// Reactive data
const students = ref<Student[]>(staticStudents);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');

// Define columns for students table
const columns = computed(() => {
  const baseColumns: Column[] = [
    {
      key: 'code',
      label: 'Code',
      type: 'code',
      sortable: true,
      width: '80px'
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'class',
      label: 'Class',
      type: 'text',
      sortable: true
    },
    {
      key: 'grade',
      label: 'Grade',
      type: 'text',
      sortable: true
    },
    {
      key: 'contact',
      label: 'Contact',
      type: 'text'
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View students') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: 'Actions',
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-eye', label: 'View', color: '#10b981' },
        { icon: 'fa-regular fa-edit', label: 'Edit', color: '#3b82f6' },
        { icon: 'fa-solid fa-trash', label: 'Delete', color: '#dc3545' }
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
      id: 'new-student',
      permission: 'View students',
      config: {
        label: 'New Student',
        icon: 'fa-plus',
        variant: 'btn-primary'
      }
    }
  ]);
});

// Transform students data to include computed fields
const transformedStudents = computed(() => {
  return students.value.map(student => ({
    ...student,
    class: student.class.name,
    grade: student.grade.name,
    contact: student.motherMobile || student.fatherMobile || student.homePhone
  }));
});

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = transformedStudents.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((student) => {
      return (
        student.name.toLowerCase().includes(query) ||
        student.code.toLowerCase().includes(query) ||
        (student.motherMobile && student.motherMobile.includes(query)) ||
        (student.fatherMobile && student.fatherMobile.includes(query)) ||
        (student.homePhone && student.homePhone.includes(query))
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
  if (buttonId === 'new-student') {
    router.push('/students/create');
  }
};

const handleAction = async ({ action, row }: { action: string; row: any }) => {
  if (action === 'View') {
    router.push(`/students/view/${row.id}`);
  } else if (action === 'Edit') {
    router.push(`/students/edit/${row.id}`);
  } else if (action === 'Delete') {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        `Are you sure you want to delete student "${row.name}"? This action cannot be undone.`,
        'Confirm Delete',
        {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning',
          confirmButtonClass: 'btn-danger',
          cancelButtonClass: 'btn-secondary'
        }
      );
      
      // User confirmed, proceed with deletion (for now just remove from local data)
      students.value = students.value.filter(s => s.id !== row.id);
      dataService.createAlertMessage('Student deleted successfully', 'success');
    } catch (error) {
      if (error !== 'cancel') {
        dataService.createAlertMessage('Failed to delete student', 'error');
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

// Lifecycle
onMounted(() => {
  // Data is already loaded as static data
});
</script>

<style scoped>
.card-body {
  /* background-color: white; */
  max-width: 1200px;
  /* padding: 2rem !important; */
}
</style>