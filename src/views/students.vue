<template>
  <div class="card-body container">
    <div v-if="selectedRows.length" class="mb-3 d-flex align-items-center gap-2 modern-toolbar">
      <button
        class="btn btn-outline-secondary d-flex align-items-center gap-1"
        @click="handleExport"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-download"></i>
        Export
      </button>
      <button
        class="btn btn-info d-flex align-items-center gap-1"
        @click="handlePrintCards"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-id-card"></i>
        Print Cards
      </button>
      <button
        class="btn btn-danger d-flex align-items-center gap-1"
        :disabled="!selectedRows.length"
        @click="handleBulkDelete"
      >
        <i class="fa fa-trash"></i>
        Delete Selected
      </button>
      <span v-if="selectedRows.length" class="selected-count-badge">
        {{ selectedRows.length }} selected
      </span>
    </div>
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="'Search by name, code, or phone'"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :selected-rows="selectedRows"
      :show-selection="true"
      @update:sort-by="handleSortBy"
      @update:sort-direction="handleSortDirection"
      @update:search-query="handleSearch"
      @button-click="handleButtonClick"
      @action="handleAction"
      @update:selectedRows="val => selectedRows = val"
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
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
import { AmiriFont } from '../assets/fonts/Amiri-normal.js';

const router = useRouter();

// Static student data
const staticStudents: Student[] = [
  {
    id: 1,
    code: '101',
    class: { id: 1, name: 'الصف الأول أ', description: 'الصف الأول الابتدائي أ' },
    name: 'أحمد محمد علي',
    number: '1',
    subStreet: 'شارع النصر',
    mainStreet: 'الشارع الرئيسي',
    area: 'وسط البلد',
    floor: 'الدور الثاني',
    apartment: 'شقة 5',
    notes: 'طالب ممتاز',
    homePhone: '02-1234567',
    motherMobile: '010-12345678',
    fatherMobile: '011-12345678',
    birthDate: '2015-03-15',
    age: 8,
    siblings: true,
    gender: 'ذكر',
    nationalId: '12345678901234',
    grade: { id: 1, name: 'الصف الأول', description: 'الصف الأول الابتدائي' }
  },
  {
    id: 2,
    code: '1005',
    class: { id: 1, name: 'الصف الأول أ', description: 'الصف الأول الابتدائي أ' },
    name: 'فاطمة حسن',
    number: '2',
    subStreet: 'شارع السلام',
    mainStreet: 'شارع السلام',
    area: 'الحي الراقي',
    floor: 'الدور الأول',
    apartment: 'شقة 12',
    notes: 'تحتاج إلى متابعة في الرياضيات',
    homePhone: '02-2345678',
    motherMobile: '010-23456789',
    fatherMobile: '011-23456789',
    birthDate: '2015-07-22',
    age: 8,
    siblings: false,
    gender: 'أنثى',
    nationalId: '23456789012345',
    grade: { id: 1, name: 'الصف الأول', description: 'الصف الأول الابتدائي' }
  },
  {
    id: 3,
    code: '2368',
    class: { id: 2, name: 'الصف الأول ب', description: 'الصف الأول الابتدائي ب' },
    name: 'عمر خليل',
    number: '3',
    subStreet: 'شارع الأمل',
    mainStreet: 'شارع الأمل',
    area: 'الأحياء الجديدة',
    floor: 'الدور الثالث',
    apartment: 'شقة 8',
    notes: 'طالب نشيط جداً',
    homePhone: '02-3456789',
    motherMobile: '010-34567890',
    fatherMobile: '011-34567890',
    birthDate: '2014-11-10',
    age: 9,
    siblings: true,
    gender: 'ذكر',
    nationalId: '34567890123456',
    grade: { id: 2, name: 'الصف الثاني', description: 'الصف الثاني الابتدائي' }
  },
  {
    id: 4,
    code: '1547',
    class: { id: 2, name: 'الصف الأول ب', description: 'الصف الأول الابتدائي ب' },
    name: 'عائشة محمود',
    number: '4',
    subStreet: 'شارع النور',
    mainStreet: 'شارع النور',
    area: 'مركز المدينة',
    floor: 'الدور الأرضي',
    apartment: 'شقة 3',
    notes: 'من المتفوقين',
    homePhone: '02-4567890',
    motherMobile: '010-45678901',
    fatherMobile: '011-45678901',
    birthDate: '2014-05-18',
    age: 9,
    siblings: true,
    gender: 'أنثى',
    nationalId: '45678901234567',
    grade: { id: 2, name: 'الصف الثاني', description: 'الصف الثاني الابتدائي' }
  },
  {
    id: 5,
    code: '154',
    class: { id: 3, name: 'الصف الأول ج', description: 'الصف الأول الابتدائي ج' },
    name: 'يوسف إبراهيم',
    number: '5',
    subStreet: 'شارع الفلاح',
    mainStreet: 'شارع النجاح',
    area: 'الحي الجديد',
    floor: 'الدور الرابع',
    apartment: 'شقة 15',
    notes: 'حسن السلوك',
    homePhone: '02-5678901',
    motherMobile: '010-56789012',
    fatherMobile: '011-56789012',
    birthDate: '2013-09-25',
    age: 10,
    siblings: false,
    gender: 'ذكر',
    nationalId: '56789012345678',
    grade: { id: 3, name: 'الصف الثالث', description: 'الصف الثالث الابتدائي' }
  }
];

// Reactive data
const students = ref<Student[]>(staticStudents);
const loading = ref(false);
const searchQuery = ref('');
const sortBy = ref('');
const sortDirection = ref('asc' as 'asc' | 'desc');
const selectedRows = ref<any[]>([]);

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

const handleBulkDelete = async () => {
  if (!selectedRows.value.length) return;
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedRows.value.length} selected students? This action cannot be undone.`,
      'Confirm Bulk Delete',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
        confirmButtonClass: 'btn-danger',
        cancelButtonClass: 'btn-secondary'
      }
    );
    // Remove selected students from the list
    students.value = students.value.filter(s => !selectedRows.value.some(sel => sel.id === s.id));
    selectedRows.value = [];
    dataService.createAlertMessage('Selected students deleted successfully', 'success');
  } catch (error) {
    if (error !== 'cancel') {
      dataService.createAlertMessage('Failed to delete selected students', 'error');
    }
  }
};

const handleAddStudent = () => {
  router.push('/students/create');
};

const handleExport = () => {
  // Export logic here (CSV, Excel, etc.)
  dataService.createAlertMessage('Export feature coming soon!', 'info');
};

const placeholderImage = '/vite.svg'; // Use vite.svg as placeholder

const handlePrintCards = async () => {
  if (!selectedRows.value.length) {
    dataService.createAlertMessage('يرجى تحديد الطلاب أولاً', 'warning');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 54] }); // ID card size
  doc.addFileToVFS('Amiri-Regular.ttf', AmiriFont);
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  doc.setFont('Amiri');

  const cardWidth = 85;
  const cardHeight = 54;

  for (let i = 0; i < selectedRows.value.length; i++) {
    if (i > 0) doc.addPage([cardWidth, cardHeight], 'landscape');
    const student = selectedRows.value[i];

    // Draw card border
    doc.setDrawColor(180);
    doc.setLineWidth(0.5);
    doc.rect(2, 2, cardWidth - 4, cardHeight - 4, 'S');

    // Generate barcode as data URL
    const barcodeCanvas = document.createElement('canvas');
    JsBarcode(barcodeCanvas, student.code, { format: 'CODE128', width: 1.2, height: 14, displayValue: false });
    const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

    // Student photo or placeholder
    const photoUrl = student.photo || placeholderImage;
    let photoDataUrl = photoUrl;
    if (!photoUrl.startsWith('data:')) {
      photoDataUrl = await new Promise(resolve => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
          const canvas = document.createElement('canvas');
          canvas.width = 24;
          canvas.height = 24;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, 24, 24);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = photoUrl;
      });
    }

    // Address in Arabic
    const address = `${student.subStreet || ''}، ${student.mainStreet || ''}، ${student.area || ''}، ${student.floor || ''}، ${student.apartment || ''}`;
    const name = student.name;
    const phone = student.motherMobile || student.fatherMobile || student.homePhone || '';

    // Layout coordinates
    const padding = 6;
    // Barcode at top left
    doc.addImage(barcodeDataUrl, 'PNG', padding, padding, 28, 10);
    // Name at top right (large, bold)
    doc.setFont('Amiri', 'normal');
    doc.setFontSize(14);
    doc.text(name, cardWidth - padding, padding + 8, { align: 'right' });

    // Photo below barcode
    doc.addImage(photoDataUrl, 'PNG', padding, padding + 14, 24, 24);

    // Info to the right of photo
    doc.setFont('Amiri', 'normal');
    doc.setFontSize(10);
    let infoX = padding + 26;
    let infoY = padding + 18;
    doc.text(`الهاتف: ${phone}`, cardWidth - padding, infoY, { align: 'right' });
    infoY += 8;
    doc.text(`العنوان: ${address}`, cardWidth - padding, infoY, { align: 'right', maxWidth: cardWidth - infoX - padding });
  }

  doc.save('student-cards.pdf');
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
.modern-toolbar {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.btn {
  border-radius: 8px !important;
  font-weight: 500;
  transition: box-shadow 0.2s;
}
.btn i {
  font-size: 1rem;
}
.selected-count-badge {
  background: #e0e7ef;
  color: #2563eb;
  border-radius: 16px;
  padding: 0.25em 0.75em;
  font-weight: 600;
  margin-left: 1rem;
  font-size: 1rem;
  letter-spacing: 0.5px;
}
</style>