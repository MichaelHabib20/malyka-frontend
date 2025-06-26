<template>
  <div class="student-view container bg-light min-vh-100 p-4">
    <!-- Header Section -->
    <div class="card shadow-sm mb-4">
      <div class="card-body p-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="d-flex align-items-center mb-2">
              <i class="fa-solid fa-user-graduate text-primary fs-2 me-3"></i>
              <div>
                <h1 class="h2 mb-1 text-dark fw-bold">Student Details</h1>
                <p class="text-muted mb-0">View and manage student information</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-primary d-flex align-items-center gap-2" @click="handleEdit">
                <i class="fa-solid fa-edit"></i>
                Edit Student
              </button>
              <button class="btn btn-danger d-flex align-items-center gap-2" @click="handleDelete">
                <i class="fa-solid fa-trash"></i>
                Delete Student
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
            <h3 class="h5 mb-0 fw-semibold">Basic Information</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Code:</span>
              <span class="badge bg-primary fs-6">{{ student.code }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Name:</span>
              <span class="fw-semibold text-dark fs-6">{{ student.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Class:</span>
              <span class="text-secondary">{{ student.class.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Grade:</span>
              <span class="badge bg-success fs-6">{{ student.grade.name }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Gender:</span>
              <span class="d-flex align-items-center gap-2">
                <i :class="student.gender === 'بنت' ? 'fa-solid fa-venus text-danger' : 'fa-solid fa-mars text-primary'"></i>
                {{ student.gender }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">National ID:</span>
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
            <h3 class="h5 mb-0 fw-semibold">Contact Information</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Home Phone:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-phone text-muted"></i>
                {{ student.homePhone || 'Not provided' }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Mother Mobile:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-mobile-alt text-muted"></i>
                {{ student.motherMobile }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">Father Mobile:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-mobile-alt text-muted"></i>
                {{ student.fatherMobile }}
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
            <h3 class="h5 mb-0 fw-semibold">Address Information</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Area:</span>
              <span class="text-secondary">{{ student.area }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Main Street:</span>
              <span class="text-secondary">{{ student.mainStreet }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Sub Street:</span>
              <span class="text-secondary">{{ student.subStreet || 'Not specified' }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Building Number:</span>
              <span class="text-secondary">{{ student.number }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Floor:</span>
              <span class="text-secondary">{{ student.floor }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">Apartment:</span>
              <span class="text-secondary">{{ student.apartment }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Information Card -->
      <div class="col-lg-6 col-xl-4">
        <div class="card shadow-sm h-100 hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-user fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">Personal Information</h3>
          </div>
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Birth Date:</span>
              <span class="d-flex align-items-center gap-2">
                <i class="fa-solid fa-calendar text-muted"></i>
                {{ formatDate(student.birthDate) }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
              <span class="fw-semibold text-dark">Age:</span>
              <span class="badge bg-warning text-dark fs-6">{{ student.age }} years</span>
            </div>
            <div class="d-flex justify-content-between align-items-center py-2">
              <span class="fw-semibold text-dark">Brothers:</span>
              <span class="text-secondary">{{ student.siblings ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Card -->
      <div class="col-12" v-if="student.notes">
        <div class="card shadow-sm hover-card">
          <div class="card-header bg-gradient text-white d-flex align-items-center gap-3">
            <i class="fa-solid fa-sticky-note fs-4"></i>
            <h3 class="h5 mb-0 fw-semibold">Notes</h3>
          </div>
          <div class="card-body p-4">
            <div class="bg-light p-3 rounded border-start border-primary border-4 fst-italic text-dark">
              {{ student.notes }}
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
            <h5 class="modal-title text-dark">Confirm Delete</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p class="text-dark">Are you sure you want to delete this student?</p>
            <p class="fw-semibold text-danger fs-6 mb-0">{{ student.name }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
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
import { useRouter } from 'vue-router';
import type { Student } from '../interfaces/student';
import FollowUpSection from './FollowUpSection.vue';

const router = useRouter();
const showDeleteModal = ref(false);

// Mock student data based on the Excel data provided
const student = ref<Student>({
  id: 1,
  code: '108',
  class: {
    id: 1,
    name: 'بدون أولياء أمور 12:15',
  },
  name: 'ايليانا عماد جورج',
  number: '114',
  subStreet: '',
  mainStreet: 'طومان باى',
  area: 'الزيتون',
  floor: '8',
  apartment: '36',
  notes: 'امام بي تك',
  homePhone: '',
  motherMobile: '01220853382',
  fatherMobile: '01225130825',
  birthDate: '2020-11-26',
  age: 4.6,
  siblings: false,
  gender: 'بنت',
  nationalId: '24356778987',
  grade: {
    id: 1,
    name: 'Baby Class (Boys)',
  },
});

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not provided';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handleEdit = () => {
  router.push(`/students/edit/${student.value.id}`);
};

const handleDelete = () => {
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const confirmDelete = () => {
  console.log('Deleting student:', student.value.id);
  showDeleteModal.value = false;
  router.push('/students');
};

const handleFollowUpAdded = () => {
  // Handle follow-up added event
};

onMounted(() => {
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
