<template>
  <div class="card-body container">
    <div v-if="selectedRows.length" class="mb-3 d-flex align-items-center gap-2 modern-toolbar">
      <!-- <button
        class="btn btn-outline-secondary d-flex align-items-center gap-1"
        @click="handleExport"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-download"></i>
        {{ $t('students.exportStudents') }}
      </button> -->
      <button
        class="btn btn-info d-flex align-items-center gap-1"
        @click="handlePrintCards"
        :disabled="!selectedRows.length"
      >
        <i class="fa fa-id-card"></i>
        {{ $t('students.printCards') }}
      </button>
      <span v-if="selectedRows.length" class="selected-count-badge">
        {{ $t('students.selectedCount', { count: selectedRows.length }) }}
      </span>
    </div>
    <DataTable
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :search-query="searchQuery"
      :search-placeholder="$t('students.searchPlaceholder')"
      :custom-buttons="customButtons"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :selected-rows="selectedRows"
      :show-selection="true"
      row-key="kid.id"
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
import { useI18n } from 'vue-i18n';
import DataTable from '../components/shared/DataTable.vue';
import type { Column } from '../interfaces/column';
import type { CustomButton } from '../interfaces/customButtons';
import type { Student } from '../interfaces/student';
import { dataService } from '../services/dataContext';
import { authService } from '../services/authService';
import { createButtonsWithPermissions } from '../utils/simplePermissions';
import { useRouter, useRoute } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
// import { AmiriFont } from '../assets/fonts/Amiri-normal.js';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// Static student data
const staticStudents: Student[] = [];

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
      key: 'kid.code',
      label: t('students.columns.code'),
      type: 'code',
      sortable: true,
      width: '80px'
    },
    {
      key: 'kid.name',
      label: t('students.columns.name'),
      type: 'editable',
      editableType: 'text',
      editablePlaceholder: 'Enter name',
      editableValidation: (value: string) => {
        if (!value) return 'Name is required';
        return null;
      },
      align: 'right',
      sortable: true,
      isMainColumn: true
    },
    {
      key: 'kid.grade.name',
      label: t('students.columns.grade'),
      type: 'grade-chip',
      align: 'center',
      sortable: false
    },
    {
      key: 'kid.class.name',
      label: t('students.columns.class'),
      type: 'text',
      align: 'center',
      sortable: true
    },
    {
      key: 'kid.area',
      label: t('students.columns.area'),
      type: 'text',
      align: 'center',
      sortable: false
    },

    {
      key: 'kid.whatsapp',
      label: t('students.columns.contact'),
      type: 'phone-chip',
      align: 'center',
      sortable: false
    },
    {
      key: 'kid.birthDate',
      label: t('students.columns.birthDate'),
      type: 'date',
      dateFormat: 'short',
      align: 'center',
      sortable: false
    },
    {
      key: 'isPresentOnLastSession',
      label: t('students.columns.lastSession'),
      type: 'attendance-status',
      align: 'center',
      sortable: false
    },
    {
      key: 'attendancePercentage',
      label: t('students.columns.attendance'),
      type: 'percentage',
      align: 'center',
      sortable: false
    }
  ];
  
  // Only add actions column if user has permission
  if (authService.hasPermission('View students') || authService.hasRole(1)) {
    baseColumns.push({
      key: 'actions',
      label: t('app.actions'),
      type: 'actions',
      actions: [
        { icon: 'fa-regular fa-eye', label: t('common.view'), color: '#10b981' },
        { icon: 'fa-regular fa-edit', label: t('common.edit'), color: '#3b82f6' },
        // { icon: 'fa-solid fa-trash', label: t('common.delete'), color: '#dc3545' }
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
    // {
    //   id: 'new-student',
    //   permission: 'View students',
    //   config: {
    //     label: t('students.newStudent'),
    //     icon: 'fa-plus',
    //     variant: 'btn-primary'
    //   }
    // }
  ]);
});

// Transform students data to include computed fields
// const transformedStudents = computed(() => {
//   return students.value.map(student => ({
//     ...student,
//     class: student.class.name,
//     grade: student.grade.name,
//     contact: student.momMob || student.dadMob || student.whatsapp
//   }));
// });

// Computed property to filter and sort data based on search and sort parameters
const filteredData = computed(() => {
  let data = students.value;
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((student :any) => {
      return (
        student.kid.name.toLowerCase().includes(query) ||
        student.kid.code.toLowerCase().includes(query) ||
        (student.kid.whatsapp && student.kid.whatsapp.includes(query))
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
  if (action === t('common.view')) {
    router.push(`/students/view/${row.kid.id}`);
  } else if (action === t('common.edit')) {
    router.push(`/students/edit/${row.kid.id}`);
  } else if (action === t('common.delete')) {
    try {
      // Show confirmation dialog
      await ElMessageBox.confirm(
        t('students.confirmDelete', { name: row.name }),
        t('common.confirmDelete'),
        {
          confirmButtonText: t('common.delete'),
          cancelButtonText: t('common.cancel'),
          type: 'warning',
          confirmButtonClass: 'btn-danger',
          cancelButtonClass: 'btn-secondary'
        }
      );
      
      // User confirmed, proceed with deletion (for now just remove from local data)
      students.value = students.value.filter(s => s.id !== row.id);
      dataService.createAlertMessage(t('students.deleteSuccess'), 'success');
    } catch (error) {
      if (error !== 'cancel') {
        dataService.createAlertMessage(t('students.deleteError'), 'error');
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
      t('students.confirmBulkDelete', { count: selectedRows.value.length }),
      t('common.confirmDelete'),
      {
        confirmButtonText: t('common.delete'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        confirmButtonClass: 'btn-danger',
        cancelButtonClass: 'btn-secondary'
      }
    );
    // Remove selected students from the list
    students.value = students.value.filter(s => !selectedRows.value.some(sel => sel.id === s.id));
    selectedRows.value = [];
    dataService.createAlertMessage(t('students.bulkDeleteSuccess'), 'success');
  } catch (error) {
    if (error !== 'cancel') {
      dataService.createAlertMessage(t('students.bulkDeleteError'), 'error');
    }
  }
};

const handleAddStudent = () => {
  router.push('/students/create');
};

const handleExport = () => {
  // Export logic here (CSV, Excel, etc.)
  dataService.createAlertMessage(t('students.exportComingSoon'), 'info');
};

const placeholderImage = '/vite.svg'; // Use vite.svg as placeholder

const handlePrintCards = async () => {
  if (!selectedRows.value.length) {
    dataService.createAlertMessage(t('students.selectStudentsFirst'), 'warning');
    return;
  }

  try {
    // Card and page layout
    const cardWidth = 85;
    const cardHeight = 60;
    const cardsPerRow = 2;
    const cardsPerCol = 4;
    const cardsPerPage = cardsPerRow * cardsPerCol;
    const pageWidth = 210;
    const pageHeight = 297;
    const cardSpacingX = 8;
    const cardSpacingY = 10;
    const margin = 15;

    // Calculate grid starting position (top-right aligned)
    const gridWidth = (cardsPerRow * cardWidth) + ((cardsPerRow - 1) * cardSpacingX);
    const gridHeight = (cardsPerCol * cardHeight) + ((cardsPerCol - 1) * cardSpacingY);
    const startX = pageWidth - margin - gridWidth;
    const startY = margin;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Try to load Arabic font
    try {
      // @ts-ignore
      const { LamaSansFont } = await import('../assets/fonts/lama-sans.js');
      doc.addFileToVFS('LamaSans-Regular.otf', LamaSansFont);
      doc.addFont('LamaSans-Regular.otf', 'LamaSans', 'normal');
      doc.setFont('LamaSans');
      console.log('hna')
    } catch (fontError) {
      try {
        // Fallback to Amiri if Lama Sans fails
        // @ts-ignore
        const { AmiriFont } = await import('../assets/fonts/Amiri-normal.js');
        doc.addFileToVFS('Amiri-Regular.ttf', AmiriFont);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.setFont('Amiri');
        console.log('hna')
      } catch (amiriError) {
        console.warn('Both Lama Sans and Amiri font loading failed, using default font:', amiriError);
        doc.setFont('helvetica');
        console.log('hna')
      }
    }

    let cardsOnCurrentPage = 0;
    for (let i = 0; i < selectedRows.value.length; i++) {
      // New page if needed
      if (cardsOnCurrentPage >= cardsPerPage) {
        doc.addPage();
        cardsOnCurrentPage = 0;
      }

      // Grid position
      const row = Math.floor(cardsOnCurrentPage / cardsPerRow);
      const col = cardsOnCurrentPage % cardsPerRow;
      const cardX = startX + col * (cardWidth + cardSpacingX);
      const cardY = startY + row * (cardHeight + cardSpacingY);

      // Draw card border (single clean border)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.9);
      doc.rect(cardX, cardY, cardWidth, cardHeight, 'S');

      const studentData = selectedRows.value[i].kid;

      // Generate barcode
      try {
        const barcodeCanvas = document.createElement('canvas');
        JsBarcode(barcodeCanvas, studentData.code, {
          format: 'CODE128',
          width: 1.8,
          height: 25,
          displayValue: false,
          margin: 0
        });
        const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');
        
        // Position barcode at top-left
        const barcodeW = 35;
        const barcodeH = 12;
        const barcodeX = cardX + 2;
        const barcodeY = cardY + 2;
        doc.addImage(barcodeDataUrl, 'PNG', barcodeX, barcodeY, barcodeW, barcodeH);
      } catch (barcodeError) {
        console.warn('Barcode generation failed:', barcodeError);
      }

      // Student ID number (top-right, large and prominent)
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69); // Red color like in image
      doc.text(`الرقم: ${studentData.code}`, cardX + cardWidth - 2, cardY + 8, { align: 'right' });

      // Student information section
      const infoStartY = cardY + 18;
      let currentY = infoStartY;

      // Set font for all text
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      // Helper function to add a field
      function addField(label: string, value: string, y: number) {
        if (value) {
          // Create the full text with label and value on same line
          const fullText = `${label}: ${value}`;
          doc.setFontSize(12);
          
          // Split text to fit card width, keeping Arabic text properly aligned
          const textLines = doc.splitTextToSize(fullText, cardWidth - 6);
          let currentLineY = y;
          
          for (let line of textLines) {
            doc.text(line, cardX + cardWidth - 3, currentLineY, { align: 'right' });
            currentLineY += 4;
          }
          
          return currentLineY - y + 2; // Return height used
        }
        return 0;
      }

      // Student name
      const nameHeight = addField('الاسم', studentData.name, currentY);
      currentY += nameHeight;

      // Address
      const addressParts = [
        studentData.buildingNumber,
        studentData.sideStreet,
        studentData.mainStreet,
        studentData.area
      ].filter(Boolean);
      
      if (addressParts.length > 0) {
        const address = addressParts.join('، ');
        const addressHeight = addField('العنوان', address, currentY);
        currentY += addressHeight;
      }

      // Phone number
      const phone = studentData.whatsapp || studentData.momMob || studentData.dadMob || '';
      if (phone) {
        const phoneHeight = addField('التليفون', phone, currentY);
        currentY += phoneHeight;
      }

      // // Birth date (if available)
      // if (studentData.birthDate) {
      //   const birthDate = new Date(studentData.birthDate).toLocaleDateString('ar-EG');
      //   addField('تاريخ الميلاد', birthDate, currentY);
      // }

      cardsOnCurrentPage++;
    }

    doc.save('student-cards.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    dataService.createAlertMessage(t('students.pdfGenerationError') || 'Error generating PDF', 'error');
  }
};

const handleGetStudentById = async (id: string) => {
  const response : any = await dataService.fetchOnline(`/api/KidsRegistration/GetKidById/${id}`)
  console.log(response)
  students.value = [response.data]
  console.log(students.value)
  console.log(filteredData.value)
}

const getStudents = async () => {
  const response : any = await dataService.fetchOnline(`/api/KidsRegistration/GetKids`)
  students.value = response.data.kids
}

// Lifecycle
onMounted(() => {
  if(route.params.id){
    handleGetStudentById(route.params.id as string)
  }else{
    getStudents()
  }
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