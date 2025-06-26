<template>
  <div class="follow-up-section">
    <!-- Follow-up Section -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-gradient text-white d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <i class="fa-solid fa-heart-pulse fs-4"></i>
          <h3 class="h5 mb-0 fw-semibold">Student Follow-up (افتقاد)</h3>
        </div>
        <button class="btn btn-light btn-sm d-flex align-items-center gap-2" @click="showAddFollowUpModal = true">
          <i class="fa-solid fa-plus"></i>
          Add Follow-up
        </button>
      </div>
      <div class="card-body p-4">
        <!-- Follow-up Summary -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="text-center p-3 bg-success bg-opacity-10 rounded">
              <i class="fa-solid fa-check-circle text-success fs-2 mb-2"></i>
              <h6 class="mb-1">Good Status</h6>
              <span class="badge bg-success fs-6">{{ getFollowUpCount('good') }}</span>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 bg-warning bg-opacity-10 rounded">
              <i class="fa-solid fa-exclamation-triangle text-warning fs-2 mb-2"></i>
              <h6 class="mb-1">Needs Care</h6>
              <span class="badge bg-warning text-dark fs-6">{{ getFollowUpCount('needs_care') }}</span>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 bg-danger bg-opacity-10 rounded">
              <i class="fa-solid fa-heart-crack text-danger fs-2 mb-2"></i>
              <h6 class="mb-1">Bad Mood</h6>
              <span class="badge bg-danger fs-6">{{ getFollowUpCount('bad_mood') }}</span>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 bg-info bg-opacity-10 rounded">
              <i class="fa-solid fa-calendar-check text-info fs-2 mb-2"></i>
              <h6 class="mb-1">Total Follow-ups</h6>
              <span class="badge bg-info fs-6">{{ followUps.length }}</span>
            </div>
          </div>
        </div>

        <!-- Follow-up Timeline -->
        <div class="follow-up-timeline">
          <h6 class="mb-3 text-dark fw-semibold">Recent Follow-ups</h6>
          <div class="timeline-container">
            <div v-for="followUp in sortedFollowUps" :key="followUp.id" class="timeline-item">
              <div class="timeline-marker" :class="getStatusClass(followUp.status)">
                <i :class="getStatusIcon(followUp.status)"></i>
              </div>
              <div class="timeline-content">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <span class="badge" :class="getTypeClass(followUp.type)">
                      {{ followUp.type === 'call' ? 'Phone Call' : 'Home Visit' }}
                    </span>
                    <span class="ms-2 text-muted small">{{ formatDate(followUp.date) }}</span>
                  </div>
                  <span class="badge" :class="getStatusBadgeClass(followUp.status)">
                    {{ getStatusText(followUp.status) }}
                  </span>
                </div>
                <p class="mb-2 text-dark">{{ followUp.notes }}</p>
                <div v-if="followUp.nextFollowUp" class="small text-muted">
                  <i class="fa-solid fa-calendar-plus me-1"></i>
                  Next follow-up: {{ formatDate(followUp.nextFollowUp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Follow-up Modal -->
    <div class="modal fade" :class="{ show: showAddFollowUpModal }" :style="{ display: showAddFollowUpModal ? 'block' : 'none' }" 
         tabindex="-1" @click="closeAddFollowUpModal">
      <div class="modal-dialog modal-dialog-centered modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-dark">
              <i class="fa-solid fa-heart-pulse text-primary me-2"></i>
              Add New Follow-up
            </h5>
            <button type="button" class="btn-close" @click="closeAddFollowUpModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addFollowUp">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Follow-up Type</label>
                  <div class="d-flex gap-2">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="type" id="type-call" 
                             value="call" v-model="newFollowUp.type">
                      <label class="form-check-label" for="type-call">
                        <i class="fa-solid fa-phone text-primary me-1"></i>
                        Phone Call
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="type" id="type-visit" 
                             value="home_visit" v-model="newFollowUp.type">
                      <label class="form-check-label" for="type-visit">
                        <i class="fa-solid fa-house text-success me-1"></i>
                        Home Visit
                      </label>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Student Status</label>
                  <select class="form-select" v-model="newFollowUp.status">
                    <option value="good">Good - Doing Fine</option>
                    <option value="needs_care">Needs Care & Attention</option>
                    <option value="bad_mood">Bad Mood - Needs Support</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Follow-up Notes</label>
                  <textarea class="form-control" rows="4" v-model="newFollowUp.notes" 
                            placeholder="Describe the student's condition, behavior, and any observations..."></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">Next Follow-up Date (Optional)</label>
                  <input type="date" class="form-control" v-model="newFollowUp.nextFollowUp">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddFollowUpModal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="addFollowUp">
              <i class="fa-solid fa-save me-1"></i>
              Save Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div class="modal-backdrop fade show" v-if="showAddFollowUpModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { FollowUp,FollowUpForm } from '../interfaces/student';
const props = defineProps<{
  studentId: number;
}>();

const emit = defineEmits<{
  (e: 'followUpAdded', followUp: FollowUp): void;
}>();

const showAddFollowUpModal = ref(false);

// Mock follow-up data
const followUps = ref<FollowUp[]>([
  {
    id: 1,
    studentId: props.studentId,
    date: '2025-01-15',
    type: 'call',
    status: 'good',
    notes: 'Student is doing well in class. Parents reported good behavior at home. No concerns.',
    nextFollowUp: '2025-02-15',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    studentId: props.studentId,
    date: '2025-01-08',
    type: 'home_visit',
    status: 'needs_care',
    notes: 'Home visit conducted. Student seems a bit withdrawn. Parents mentioned some family stress. Recommended extra attention.',
    nextFollowUp: '2025-01-22',
    createdAt: '2025-01-08T14:20:00Z'
  },
  {
    id: 3,
    studentId: props.studentId,
    date: '2024-12-20',
    type: 'call',
    status: 'good',
    notes: 'Regular check-in call. Student is happy and engaged in school activities. Parents are satisfied with progress.',
    createdAt: '2024-12-20T09:15:00Z'
  }
]);

// New follow-up form
const newFollowUp = ref<FollowUpForm>({
  type: 'call',
  status: 'good',
  notes: '',
  nextFollowUp: ''
});

const sortedFollowUps = computed(() => {
  return [...followUps.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not provided';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getFollowUpCount = (status: string): number => {
  return followUps.value.filter(f => f.status === status).length;
};

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'good': return 'status-good';
    case 'needs_care': return 'status-warning';
    case 'bad_mood': return 'status-danger';
    default: return '';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'good': return 'fa-solid fa-check-circle';
    case 'needs_care': return 'fa-solid fa-exclamation-triangle';
    case 'bad_mood': return 'fa-solid fa-heart-crack';
    default: return 'fa-solid fa-circle';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'good': return 'Good';
    case 'needs_care': return 'Needs Care';
    case 'bad_mood': return 'Bad Mood';
    default: return 'Unknown';
  }
};

const getTypeClass = (type: string): string => {
  return type === 'call' ? 'bg-primary' : 'bg-success';
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'good': return 'bg-success';
    case 'needs_care': return 'bg-warning text-dark';
    case 'bad_mood': return 'bg-danger';
    default: return 'bg-secondary';
  }
};

const closeAddFollowUpModal = () => {
  showAddFollowUpModal.value = false;
  // Reset form
  newFollowUp.value = {
    type: 'call',
    status: 'good',
    notes: '',
    nextFollowUp: ''
  };
};

const addFollowUp = () => {
  if (!newFollowUp.value.notes.trim()) {
    alert('Please add notes for the follow-up');
    return;
  }

  const followUp: FollowUp = {
    id: followUps.value.length + 1,
    studentId: props.studentId,
    date: new Date().toISOString().split('T')[0],
    type: newFollowUp.value.type,
    status: newFollowUp.value.status,
    notes: newFollowUp.value.notes,
    nextFollowUp: newFollowUp.value.nextFollowUp || undefined,
    createdAt: new Date().toISOString()
  };

  followUps.value.unshift(followUp);
  emit('followUpAdded', followUp);
  closeAddFollowUpModal();
};
</script>

<style scoped>
/* Follow-up Timeline Styles */
.follow-up-timeline {
  position: relative;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -1.5rem;
  top: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  z-index: 1;
}

.timeline-marker.status-good {
  background: #28a745;
}

.timeline-marker.status-warning {
  background: #ffc107;
}

.timeline-marker.status-danger {
  background: #dc3545;
}

.timeline-content {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .timeline-container {
    padding-left: 1rem;
  }

  .timeline-item {
    padding-left: 1rem;
  }

  .timeline-marker {
    left: -0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.7rem;
  }
}
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style> 