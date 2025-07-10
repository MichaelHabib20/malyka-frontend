<template>
  <div class="student-view container bg-light min-vh-100 p-4" v-if="student && !loading">
    <!-- Header Section -->
    <div class="card shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center mb-2">
              <i class="fa-solid fa-user-graduate text-primary fs-2 me-3"></i>
              <div>
                <h1 class="h2 mb-1 text-dark fw-bold">{{ $t('students.viewStudent') }}</h1>
                <p class="text-muted mb-0">{{ $t('students.viewDescription') }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary d-flex align-items-center gap-2" @click="handleEdit">
                <i class="fa-solid fa-edit"></i>
                {{ $t('common.edit') }}
              </button>
              <button class="btn btn-danger d-flex align-items-center gap-2" @click="handleDelete">
                <i class="fa-solid fa-trash"></i>
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Information Cards -->
    <div class="row g-4 mb-4">
      <!-- Basic Information Card -->
      <div class="col-lg-6 col-xl-4">
        <div class="card shadow-sm h-100 hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-id-card fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">{{ $t('students.form.personalInfo') }}</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.code') }}:</span>
              <span class="badge bg-primary fs-6">{{ student.code }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.fullName') }}:</span>
              <span class="fw-semibold text-dark fs-6">{{ student.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.class') }}:</span>
              <span class="text-secondary">{{ student.class?.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.grade') }}:</span>
              <span class="badge bg-success fs-6">{{ student.grade?.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.gender') }}:</span>
              <span class="d-flex align-items-center gap-2">
                <i :class="student.gender === 'بنت' ? 'fa-solid fa-venus text-danger' : 'fa-solid fa-mars text-primary'"></i>
                {{ student.gender }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">{{ $t('students.form.nationalId') }}:</span>
              <span class="text-secondary">{{ student.nationalId }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information Card -->
      <div class="col-lg-6 col-xl-4">
        <div class="card shadow-sm h-100 hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-phone fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">{{ $t('students.form.contactInfo') }}</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.whatsapp') }}:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-phone text-muted"></i>
                {{ student.whatsapp || $t('students.notProvided') }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.motherMobile') }}:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-mobile-alt text-muted"></i>
                {{ student.momMob }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">{{ $t('students.form.fatherMobile') }}:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-mobile-alt text-muted"></i>
                {{ student.dadMob }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Address Information Card -->
      <div class="col-lg-6 col-xl-4">
        <div class="card shadow-sm h-100 hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-map-marker-alt fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">{{ $t('students.form.addressInfo') }}</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.area') }}:</span>
              <span class="text-secondary">{{ student.area }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.mainStreet') }}:</span>
              <span class="text-secondary">{{ student.mainStreet }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.sideStreet') }}:</span>
              <span class="text-secondary">{{ student.sideStreet || $t('students.notSpecified') }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.buildingNumber') }}:</span>
              <span class="text-secondary">{{ student.number }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.floor') }}:</span>
              <span class="text-secondary">{{ student.floor }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">{{ $t('students.form.apartmentNumber') }}:</span>
              <span class="text-secondary">{{ student.apartmentNumber }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Information Card -->
      <div class="col-lg-6 col-xl-4">
        <div class="card shadow-sm h-100 hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-user fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">{{ $t('students.form.personalInfo') }}</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.form.birthDate') }}:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-calendar text-muted"></i>
                {{ formatDate(student.birthDate) }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">{{ $t('students.age') }}:</span>
              <span class="badge bg-warning text-dark fs-6">
                {{ calculateAge(student.birthDate).years }}{{ $t('students.years') }} {{ calculateAge(student.birthDate).months }}{{ $t('students.months') }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">{{ $t('students.form.siblings') }}:</span>
              <span class="text-secondary">{{ student.siblings ? $t('common.yes') : $t('common.no') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Card -->
      <div class="col-12" v-if="student.landmark">
        <div class="card shadow-sm hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-sticky-note fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">{{ $t('students.form.notes') }}</h3>
          </div>
          <div class="card-body p-4">
            <div class="bg-light p-3 rounded border-start border-primary border-4 fst-italic text-dark">
              {{ student.landmark }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Follow-up Section -->
    <FollowUpSection 
      :studentId="student.id" 
      @followUpAdded="handleFollowUpAdded"
    />

    <!-- Confirmation Modal for Delete -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" 
         tabindex="-1" @click="closeDeleteModal">
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-dark">{{ $t('common.confirmDelete') }}</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p class="text-dark">{{ $t('students.deleteConfirmation', { name: student.name }) }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">{{ $t('common.cancel') }}</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal backdrop -->
    <div class="modal-backdrop fade show" v-if="showDeleteModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { Student } from '../interfaces/student';
import FollowUpSection from './FollowUpSection.vue';
import { useRoute } from 'vue-router';
import { dataService } from '../services/dataContext';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const showDeleteModal = ref(false);
const loading = ref(false);

// Mock student data based on the Excel data provided
const student = ref<Student>();

const formatDate = (dateString: string): string => {
  if (!dateString) return t('students.notProvided');
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const calculateAge = (birthDate: string): { years: number; months: number } => {
  if (!birthDate) return { years: 0, months: 0 };
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Adjust for day of month
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return { years, months };
};

const handleEdit = () => {
  router.push(`/students/edit/${student.value?.id}`);
};

const handleDelete = () => {
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDelete = () => {
  console.log('Deleting student:', student.value?.id);
  showDeleteModal.value = false;
  router.push('/students');
};

const handleFollowUpAdded = () => {
  // Handle follow-up added event
};

const handleGetStudentById = async (id: string) => {
  const response : any = await dataService.fetchOnline(`/api/KidsRegistration/GetKidById/${id}`)
  if(response){
    loading.value = false
    student.value = response.data.kid
  }
}

onMounted(() => {
  if(route.params.id){
    loading.value = true
    handleGetStudentById(route.params.id as string)
  }
  // Load student data based on route parameter
  // For now using mock data
});
</script>

<style scoped>
/* Minimal custom CSS - only for specific styling that Bootstrap doesn't cover */
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.hover-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Follow-up Timeline Styles */
.follow-up-timeline {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
  
  .d-flex.justify-content-between .text-secondary,
  .d-flex.justify-content-between .badge,
  .d-flex.justify-content-between .d-flex {
    align-self: flex-end;
  }
}
</style>
