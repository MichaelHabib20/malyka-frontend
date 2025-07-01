<template>
  <div class="container">
    <!-- Student Search Section -->
    <div class="row justify-content-start mb-4">
      <div class="col-md-6 col-lg-5">
        <Input
          id="student-search"
          v-model="searchQuery"
          label="Search Student"
          placeholder="Search by name or code..."
          :leading-icon="'fas fa-search'"
          :suggestions="filteredStudents"
          @suggestion-selected="selectStudent"
          @keydown.enter="handleEnterKey"
        />
      </div>
      <div v-if="selectedStudent" class="row justify-content-center col-md-6 col-lg-7 mb-4">
      <div class="col-12">
        <div class="card shadow-sm border-0">
          <div class="card-body d-flex align-items-center">
            <div class="me-3">
              <img v-if="selectedStudent.photo" :src="selectedStudent.photo" :alt="selectedStudent.name" class="rounded-circle" width="60" height="60" />
              <div v-else class="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-bold" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                {{ selectedStudent.name.charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-grow-1">
              <h4 class="card-title mb-1">{{ selectedStudent.name }}</h4>
              <p class="text-muted mb-1">Code: {{ selectedStudent.code }}</p>
              <p class="text-muted small mb-0">{{ selectedStudent.class?.name }} - {{ selectedStudent.grade?.name }}</p>
            </div>
            <div>
              <button class="btn btn-outline-secondary btn-sm" @click="clearSelection">
                <i class="fas fa-times me-1"></i>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Selected Student Info -->


    <!-- Events Section -->
    <div v-if="selectedStudent" class="row">
      <div class="col-12">

        <!-- Event Tabs -->
        <div class="row g-3 mb-4">
          <div
            v-for="event in availableEvents"
            :key="event.id"
            class="col-md-6 col-lg-4"
          >
            <div 
              class="card h-100 shadow-sm border-0 cursor-pointer position-relative"
              :class="{ 'border-primary border-2': selectedEvent?.id === event.id }"
              @click="selectEvent(event)"
            >
              <!-- Selected Event Indicator -->
              <div v-if="selectedEvent?.id === event.id" class="position-absolute top-0 start-0 w-100">
                <div class="bg-primary text-white text-center py-2 px-3 rounded-top">
                  <i class="fas fa-check-circle me-2"></i>
                  <span class="fw-bold">Currently Selected</span>
                </div>
              </div>
              
              <div class="card-body" :class="{ 'pt-5': selectedEvent?.id === event.id }">
                <h5 class="card-title fw-bold text-dark mb-2">{{ event.name }}</h5>
                <p class="card-text text-muted small mb-3">{{ event.description }}</p>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge bg-light text-dark">
                    <i class="fas fa-calendar me-1"></i>
                    {{ formatDate(event.startDate) }}
                  </span>
                  <span class="badge bg-primary">
                    <i class="fas fa-users me-1"></i>
                    {{ event.maxTeams }} teams
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-success">
                    <i class="fas fa-money-bill me-1"></i>
                    {{ event.price }} EGP
                  </span>
                  <span class="badge bg-info">
                    <i class="fas fa-credit-card me-1"></i>
                    {{ event.numberOfInstallments }} installments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Teams Section -->
        <div v-if="selectedEvent" class="card shadow-sm border-0">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white" style="width: 40px; height: 40px;">
                    <i class="fas fa-users"></i>
                  </div>
                </div>
                <div>
                  <h3 class="h4 mb-0 fw-bold text-dark">{{ selectedEvent.name }} Teams</h3>
                  <p class="text-muted mb-0 small">Manage team enrollments for this event</p>
                </div>
              </div>
              <div class="d-flex gap-3">
                <span class="badge bg-success">
                  <i class="fas fa-users me-1"></i>
                  {{ totalBookedStudents }} enrolled
                </span>
                <span class="badge bg-info">
                  <i class="fas fa-clock me-1"></i>
                  {{ availableSlots }} slots available
                </span>
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <!-- Teams Grid -->
            <div class="row g-3">
              <div
                v-for="team in eventTeams"
                :key="team.id"
                class="col-md-6 col-lg-4"
              >
                <div class="card h-100 border-0 shadow-sm" :class="{ 'opacity-75': team.currentMembers >= team.maxCapacity }">
                  <div class="card-header text-white" :style="{ backgroundColor: team.color }">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="mb-0 fw-bold">{{ team.name }}</h6>
                      <span class="badge bg-white bg-opacity-25 text-white">
                        {{ team.currentMembers }}/{{ team.maxCapacity }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="card-body">
                    <div class="mb-3">
                      <div class="d-flex align-items-center mb-2">
                        <i class="fas fa-male text-primary me-2"></i>
                        <span class="small text-muted">{{ getTeamStats(team).maleCount }} boys</span>
                      </div>
                      <div class="d-flex align-items-center mb-2">
                        <i class="fas fa-female text-danger me-2"></i>
                        <span class="small text-muted">{{ getTeamStats(team).femaleCount }} girls</span>
                      </div>
                      <div class="d-flex align-items-center">
                        <i class="fas fa-user-plus text-success me-2"></i>
                        <span class="small text-muted">{{ getTeamStats(team).availableSlots }} available</span>
                      </div>
                    </div>

                    <!-- Booking Section -->
                    <div v-if="!isStudentBooked(team.id) && team.currentMembers < team.maxCapacity" class="booking-section">
                      <div class="mb-3">
                        <label class="form-label fw-bold small text-muted mb-2">Select Installments:</label>
                        <div class="d-flex flex-wrap gap-2">
                          <!-- Individual Installment Checkboxes -->
                          <div 
                            v-for="installment in selectedEvent?.numberOfInstallments || 1"
                            :key="installment"
                            class="form-check"
                          >
                            <input 
                              class="form-check-input" 
                              type="checkbox" 
                              :id="`installment-${installment}-${team.id}`"
                              :value="installment"
                              v-model="selectedInstallments"
                            >
                            <label class="form-check-label small" :for="`installment-${installment}-${team.id}`">
                              <i class="fas fa-credit-card text-success me-1"></i>
                              Installment {{ installment }} ({{ Math.ceil((selectedEvent?.price || 0) / (selectedEvent?.numberOfInstallments || 1)) }} EGP)
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Notes Input -->
                      <div class="mb-3">
                        <label :for="'notes-' + team.id" class="form-label fw-bold small text-muted mb-2">Notes (Optional):</label>
                        <textarea
                          :id="'notes-' + team.id"
                          v-model="bookingNotes"
                          class="form-control form-control-sm"
                          placeholder="Add any special notes for this booking..."
                          rows="2"
                        ></textarea>
                      </div>

                      <!-- Book Button -->
                      <button 
                        class="btn btn-primary btn-sm w-100"
                        @click="handleInlineBooking(team)"
                        :disabled="isBooking"
                      >
                        <i v-if="isBooking" class="fas fa-spinner fa-spin me-2"></i>
                        <i v-else class="fas fa-plus me-2"></i>
                        {{ isBooking ? 'Booking...' : 'Book This Team' }}
                      </button>
                    </div>

                    <!-- Already Booked Status -->
                    <div v-else-if="isStudentBooked(team.id)" class="text-center py-3">
                      <div class="text-success mb-2">
                        <i class="fas fa-check-circle fa-2x"></i>
                      </div>
                      <p class="text-success fw-bold mb-1">Already Booked</p>
                      <p class="text-muted small mb-0">You're enrolled in this team</p>
                      
                      <!-- Payment Status -->
                      <div v-if="selectedEvent && selectedStudent" class="mt-3">
                        <div v-if="getPaymentStatus(selectedStudent.id, selectedEvent.id)" class="mb-2">
                          <span class="badge" :class="getPaymentStatus(selectedStudent.id, selectedEvent.id)?.class">
                            <i class="fas fa-money-bill me-1"></i>
                            {{ getPaymentStatus(selectedStudent.id, selectedEvent.id)?.text }}
                          </span>
                        </div>
                        <button 
                          class="btn btn-outline-info btn-sm"
                          @click="showPaymentHistory(selectedStudent.id, selectedEvent.id)"
                        >
                          <i class="fas fa-history me-2"></i>
                          Payment History
                        </button>
                      </div>
                    </div>

                    <!-- Team Full Status -->
                    <div v-else class="text-center py-3">
                      <div class="text-muted mb-2">
                        <i class="fas fa-users fa-2x"></i>
                      </div>
                      <p class="text-muted fw-bold mb-1">Team Full</p>
                      <p class="text-muted small mb-0">No available slots</p>
                    </div>

                    <!-- View Team Details -->
                    <div class="mt-3">
                      <button 
                        class="btn btn-outline-secondary btn-sm w-100"
                        @click="showTeamDetails(team)"
                      >
                        <i class="fas fa-eye me-2"></i>
                        View Team Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Details Modal -->
    <div v-if="showTeamDetailsFlag" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ selectedTeam?.name }} Team Details</h5>
            <button type="button" class="btn-close" @click="closeTeamDetails"></button>
          </div>
          
          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
              <div class="d-flex align-items-center">
                <div class="rounded me-3" :style="{ backgroundColor: selectedTeam?.color, width: '40px', height: '40px' }"></div>
                <div>
                  <h6 class="mb-1 fw-bold">{{ selectedTeam?.name }}</h6>
                  <p class="text-muted mb-0">{{ selectedTeam?.currentMembers }}/{{ selectedTeam?.maxCapacity }} members</p>
                </div>
              </div>
              <div v-if="selectedTeam?.notes" class="text-end" style="max-width: 300px;">
                <h6 class="fw-bold mb-1">Notes:</h6>
                <p class="text-muted small mb-0">{{ selectedTeam.notes }}</p>
              </div>
            </div>
            
            <h6 class="fw-bold mb-3">Team Members</h6>
            <div class="row g-3">
              <div
                v-for="member in selectedTeam?.members"
                :key="member.id"
                class="col-md-6"
              >
                <div class="card border-0 bg-light">
                  <div class="card-body d-flex align-items-center">
                    <div class="rounded-circle bg-gradient d-flex align-items-center justify-content-center text-white fw-bold me-3" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      {{ member.studentName.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-1 fw-bold">{{ member.studentName }}</h6>
                      <p class="text-muted small mb-1">{{ member.studentCode }}</p>
                      <span class="badge" :class="member.gender === 'male' ? 'bg-primary' : 'bg-danger'">
                        <i :class="member.gender === 'male' ? 'fas fa-male' : 'fas fa-female'" class="me-1"></i>
                        {{ member.gender === 'male' ? 'Boy' : 'Girl' }}
                      </span>
                    </div>
                    <div class="text-end">
                      <small class="text-muted">Joined {{ formatDate(member.joinedAt) }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History Modal -->
    <div v-if="showPaymentHistoryFlag" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">Payment History</h5>
            <button type="button" class="btn-close" @click="closePaymentHistory"></button>
          </div>
          
          <div class="modal-body" v-if="selectedPaymentHistory">
            <!-- Payment Summary -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card bg-light border-0">
                  <div class="card-body">
                    <h6 class="fw-bold mb-2">Payment Summary</h6>
                    <div class="d-flex justify-content-between mb-1">
                      <span class="text-muted">Total Amount:</span>
                      <span class="fw-bold">{{ selectedPaymentHistory.totalAmount }} EGP</span>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span class="text-muted">Paid Amount:</span>
                      <span class="fw-bold text-success">{{ selectedPaymentHistory.totalPaidAmount }} EGP</span>
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span class="text-muted">Remaining:</span>
                      <span class="fw-bold text-danger">{{ selectedPaymentHistory.totalAmount - selectedPaymentHistory.totalPaidAmount }} EGP</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span class="text-muted">Installments:</span>
                      <span class="fw-bold">{{ selectedPaymentHistory.paidInstallments }}/{{ selectedPaymentHistory.installmentType }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light border-0">
                  <div class="card-body">
                    <h6 class="fw-bold mb-2">Payment Status</h6>
                    <div class="mb-2">
                      <span class="badge" :class="selectedPaymentHistory.isFullyPaid ? 'bg-success' : 'bg-warning'">
                        <i class="fas fa-money-bill me-1"></i>
                        {{ selectedPaymentHistory.isFullyPaid ? 'Fully Paid' : 'Partially Paid' }}
                      </span>
                    </div>
                    <div v-if="!selectedPaymentHistory.isFullyPaid" class="small text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      Next payment due: {{ formatDate(selectedPaymentHistory.nextPaymentDue || '') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History Table -->
            <h6 class="fw-bold mb-3">Payment History</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Receipt</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in selectedPaymentHistory.payments" :key="payment.id">
                    <td>{{ payment.installmentNumber }}</td>
                    <td class="fw-bold">{{ payment.amount }} EGP</td>
                    <td>
                      <span class="badge bg-secondary">
                        <i class="fas fa-credit-card me-1"></i>
                        {{ payment.paymentMethod.replace('_', ' ').toUpperCase() }}
                      </span>
                    </td>
                    <td>{{ payment.receiptNumber || '-' }}</td>
                    <td>{{ formatDate(payment.paidAt) }}</td>
                    <td>
                      <span class="badge bg-success">
                        <i class="fas fa-check me-1"></i>
                        {{ payment.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedStudent" class="text-center py-5">
      <div class="mb-4">
        <i class="fas fa-search text-muted" style="font-size: 4rem;"></i>
      </div>
      <h3 class="fw-bold text-dark mb-2">Search for a Student</h3>
      <p class="text-muted">Enter a student's name or code to view their event booking options</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { dataService } from '../services/dataContext';
import Input from '../components/shared/input.vue';
import type { Student } from '../interfaces/student';
import type { Event, Team, EventBooking, InstallmentPayment, PaymentHistory } from '../interfaces/event';

// State
const searchQuery = ref('');
const selectedStudent = ref<Student | null>(null);
const selectedEvent = ref<Event | null>(null);
const selectedTeam = ref<Team | null>(null);
const bookingNotes = ref('');
const isBooking = ref(false);
const selectedInstallments = ref<number[]>([]);

// Payment recording state
const newPaymentMethod = ref<'cash' | 'card' | 'bank_transfer' | 'other'>('cash');
const newPaymentAmount = ref<number>(0);
const newPaymentReceipt = ref<string>('');
const newPaymentNotes = ref<string>('');
const isRecordingPayment = ref<boolean>(false);

// Modal states
const showTeamDetailsFlag = ref(false);
const showPaymentHistoryFlag = ref(false);
const selectedPaymentHistory = ref<PaymentHistory | null>(null);

// Payment tracking data
const installmentPayments = ref<InstallmentPayment[]>([
  {
    id: 1,
    bookingId: 1,
    installmentNumber: 1,
    amount: 500,
    paidAt: "2024-01-20T10:00:00Z",
    paymentMethod: "cash",
    receiptNumber: "RCP001",
    notes: "Full payment",
    status: "completed"
  },
  {
    id: 2,
    bookingId: 2,
    installmentNumber: 1,
    amount: 250,
    paidAt: "2024-01-21T10:00:00Z",
    paymentMethod: "card",
    receiptNumber: "RCP002",
    notes: "First installment",
    status: "completed"
  },
  {
    id: 3,
    bookingId: 3,
    installmentNumber: 1,
    amount: 167,
    paidAt: "2024-01-22T10:00:00Z",
    paymentMethod: "bank_transfer",
    receiptNumber: "RCP003",
    notes: "First installment",
    status: "completed"
  },
  {
    id: 4,
    bookingId: 4,
    installmentNumber: 1,
    amount: 300,
    paidAt: "2024-01-25T10:00:00Z",
    paymentMethod: "cash",
    receiptNumber: "RCP004",
    notes: "Full payment",
    status: "completed"
  }
]);

// Test Data
const students = ref<Student[]>([
  {
    id: 1,
    code: "1001",
    name: "Ahmed Hassan",
    number: "1001",
    subStreet: "Main St",
    mainStreet: "Downtown",
    area: "Cairo",
    floor: "2",
    apartment: "15",
    notes: "Excellent student",
    homePhone: "02-1234567",
    motherMobile: "010-12345678",
    fatherMobile: "010-87654321",
    birthDate: "2010-05-15",
    age: 13,
    siblings: true,
    gender: "male",
    nationalId: "12345678901234",
    class: { id: 1, name: "Class A", gradeId: 1 },
    grade: { id: 1, name: "Grade 7",  }
  },
  {
    id: 2,
    code: "1002",
    name: "Fatima Ali",
    number: "1002",
    subStreet: "School St",
    mainStreet: "Uptown",
    area: "Alexandria",
    floor: "1",
    apartment: "8",
    notes: "Very active in sports",
    homePhone: "03-2345678",
    motherMobile: "010-23456789",
    fatherMobile: "010-98765432",
    birthDate: "2011-08-22",
    age: 12,
    siblings: false,
    gender: "female",
    nationalId: "23456789012345",
    class: { id: 2, name: "Class B", gradeId: 1 },
    grade: { id: 1, name: "Grade 7",  }
  },
  {
    id: 3,
    code: "1003",
    name: "Omar Khalil",
    number: "1003",
    subStreet: "Park Ave",
    mainStreet: "Midtown",
    area: "Giza",
    floor: "3",
    apartment: "22",
    notes: "Good at mathematics",
    homePhone: "02-3456789",
    motherMobile: "010-34567890",
    fatherMobile: "010-09876543",
    birthDate: "2010-12-10",
    age: 13,
    siblings: true,
    gender: "male",
    nationalId: "34567890123456",
    class: { id: 1, name: "Class A", gradeId: 1 },
    grade: { id: 1, name: "Grade 7",  }
  },
  {
    id: 4,
    code: "1004",
    name: "Aisha Mohamed",
    number: "1004",
    subStreet: "River Rd",
    mainStreet: "Riverside",
    area: "Cairo",
    floor: "1",
    apartment: "5",
    notes: "Creative and artistic",
    homePhone: "02-4567890",
    motherMobile: "010-45678901",
    fatherMobile: "010-10987654",
    birthDate: "2011-03-18",
    age: 12,
    siblings: true,
    gender: "female",
    nationalId: "45678901234567",
    class: { id: 2, name: "Class B", gradeId: 1 },
    grade: { id: 1, name: "Grade 7" }
  },
  {
    id: 5,
    code: "1005",
    name: "Youssef Ibrahim",
    number: "1005",
    subStreet: "Hill St",
    mainStreet: "Highland",
    area: "Alexandria",
    floor: "2",
    apartment: "12",
    notes: "Natural leader",
    homePhone: "03-5678901",
    motherMobile: "010-56789012",
    fatherMobile: "010-21098765",
    birthDate: "2010-07-25",
    age: 13,
    siblings: false,
    gender: "male",
    nationalId: "56789012345678",
    class: { id: 1, name: "Class A", gradeId: 1 },
    grade: { id: 1, name: "Grade 7", }
  }
]);

const events = ref<Event[]>([
  {
    id: 1,
    name: "Science Fair 2024",
    description: "Annual science exhibition showcasing student projects and innovations",
    startDate: "2024-03-15",
    endDate: "2024-03-16",
    maxTeams: 8,
    maxTeamSize: 4,
    price: 500,
    numberOfInstallments: 3,
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    name: "Sports Tournament",
    description: "Inter-class sports competition including football, basketball, and athletics",
    startDate: "2024-04-20",
    endDate: "2024-04-22",
    maxTeams: 12,
    maxTeamSize: 6,
    price: 300,
    numberOfInstallments: 2,
    isActive: true,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: 3,
    name: "Art & Culture Festival",
    description: "Creative arts showcase featuring painting, music, drama, and dance performances",
    startDate: "2024-05-10",
    endDate: "2024-05-12",
    maxTeams: 10,
    maxTeamSize: 5,
    price: 400,
    numberOfInstallments: 4,
    isActive: true,
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z"
  },
  {
    id: 4,
    name: "Math Olympiad",
    description: "Mathematics competition with individual and team challenges",
    startDate: "2024-06-05",
    endDate: "2024-06-06",
    maxTeams: 6,
    maxTeamSize: 3,
    price: 200,
    numberOfInstallments: 1,
    isActive: false,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z"
  }
]);

const teams = ref<Team[]>([
  // Science Fair Teams
  {
    id: 1,
    eventId: 1,
    name: "Innovators",
    color: "#FF6B6B",
    maxCapacity: 4,
    currentMembers: 3,
    members: [
      {
        id: 1,
        studentId: 1,
        studentCode: "1001",
        studentName: "Ahmed Hassan",
        gender: "male",
        joinedAt: "2024-01-20T10:00:00Z"
      },
      {
        id: 2,
        studentId: 2,
        studentCode: "1002",
        studentName: "Fatima Ali",
        gender: "female",
        joinedAt: "2024-01-21T10:00:00Z"
      },
      {
        id: 3,
        studentId: 3,
        studentCode: "1003",
        studentName: "Omar Khalil",
        gender: "male",
        joinedAt: "2024-01-22T10:00:00Z"
      }
    ],
    notes: "Focus on renewable energy projects",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z"
  },
  {
    id: 2,
    eventId: 1,
    name: "Discoverers",
    color: "#4ECDC4",
    maxCapacity: 4,
    currentMembers: 2,
    members: [
      {
        id: 4,
        studentId: 4,
        studentCode: "1004",
        studentName: "Aisha Mohamed",
        gender: "female",
        joinedAt: "2024-01-20T10:00:00Z"
      },
      {
        id: 5,
        studentId: 5,
        studentCode: "1005",
        studentName: "Youssef Ibrahim",
        gender: "male",
        joinedAt: "2024-01-21T10:00:00Z"
      }
    ],
    notes: "Working on robotics and automation",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-21T10:00:00Z"
  },
  {
    id: 3,
    eventId: 1,
    name: "Explorers",
    color: "#45B7D1",
    maxCapacity: 4,
    currentMembers: 4,
    members: [
      {
        id: 6,
        studentId: 6,
        studentCode: "1006",
        studentName: "Layla Ahmed",
        gender: "female",
        joinedAt: "2024-01-20T10:00:00Z"
      },
      {
        id: 7,
        studentId: 7,
        studentCode: "1007",
        studentName: "Karim Hassan",
        gender: "male",
        joinedAt: "2024-01-21T10:00:00Z"
      },
      {
        id: 8,
        studentId: 8,
        studentCode: "1008",
        studentName: "Nour Ali",
        gender: "female",
        joinedAt: "2024-01-22T10:00:00Z"
      },
      {
        id: 9,
        studentId: 9,
        studentCode: "1009",
        studentName: "Adam Khalil",
        gender: "male",
        joinedAt: "2024-01-23T10:00:00Z"
      }
    ],
    notes: "Environmental science projects",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-23T10:00:00Z"
  },
  // Sports Tournament Teams
  {
    id: 4,
    eventId: 2,
    name: "Lions",
    color: "#FFA726",
    maxCapacity: 6,
    currentMembers: 5,
    members: [
      {
        id: 10,
        studentId: 1,
        studentCode: "1001",
        studentName: "Ahmed Hassan",
        gender: "male",
        joinedAt: "2024-01-25T10:00:00Z"
      },
      {
        id: 11,
        studentId: 3,
        studentCode: "1003",
        studentName: "Omar Khalil",
        gender: "male",
        joinedAt: "2024-01-26T10:00:00Z"
      },
      {
        id: 12,
        studentId: 5,
        studentCode: "1005",
        studentName: "Youssef Ibrahim",
        gender: "male",
        joinedAt: "2024-01-27T10:00:00Z"
      },
      {
        id: 13,
        studentId: 10,
        studentCode: "1010",
        studentName: "Hassan Mohamed",
        gender: "male",
        joinedAt: "2024-01-28T10:00:00Z"
      },
      {
        id: 14,
        studentId: 11,
        studentCode: "1011",
        studentName: "Ziad Ahmed",
        gender: "male",
        joinedAt: "2024-01-29T10:00:00Z"
      }
    ],
    notes: "Football team - strong defense",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-29T10:00:00Z"
  },
  {
    id: 5,
    eventId: 2,
    name: "Eagles",
    color: "#66BB6A",
    maxCapacity: 6,
    currentMembers: 4,
    members: [
      {
        id: 15,
        studentId: 2,
        studentCode: "1002",
        studentName: "Fatima Ali",
        gender: "female",
        joinedAt: "2024-01-25T10:00:00Z"
      },
      {
        id: 16,
        studentId: 4,
        studentCode: "1004",
        studentName: "Aisha Mohamed",
        gender: "female",
        joinedAt: "2024-01-26T10:00:00Z"
      },
      {
        id: 17,
        studentId: 12,
        studentCode: "1012",
        studentName: "Mariam Khalil",
        gender: "female",
        joinedAt: "2024-01-27T10:00:00Z"
      },
      {
        id: 18,
        studentId: 13,
        studentCode: "1013",
        studentName: "Yara Hassan",
        gender: "female",
        joinedAt: "2024-01-28T10:00:00Z"
      }
    ],
    notes: "Basketball team - fast offense",
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-28T10:00:00Z"
  }
]);

const bookings = ref<EventBooking[]>([
  {
    id: 1,
    eventId: 1,
    teamId: 1,
    studentId: 1,
    notes: "Excellent project idea",
    bookedAt: "2024-01-20T10:00:00Z",
    status: "confirmed",
    installmentType: 1,
    totalAmount: 500,
    installmentAmount: 500,
    remainingInstallments: 0,
    paidInstallments: 1,
    totalPaidAmount: 500
  },
  {
    id: 2,
    eventId: 1,
    teamId: 1,
    studentId: 2,
    notes: "Great team player",
    bookedAt: "2024-01-21T10:00:00Z",
    status: "confirmed",
    installmentType: 2,
    totalAmount: 500,
    installmentAmount: 250,
    remainingInstallments: 1,
    paidInstallments: 1,
    totalPaidAmount: 250
  },
  {
    id: 3,
    eventId: 1,
    teamId: 1,
    studentId: 3,
    notes: "Strong technical skills",
    bookedAt: "2024-01-22T10:00:00Z",
    status: "confirmed",
    installmentType: 3,
    totalAmount: 500,
    installmentAmount: 167,
    remainingInstallments: 2,
    paidInstallments: 1,
    totalPaidAmount: 167
  },
  {
    id: 4,
    eventId: 2,
    teamId: 4,
    studentId: 1,
    notes: "Team captain",
    bookedAt: "2024-01-25T10:00:00Z",
    status: "confirmed",
    installmentType: 1,
    totalAmount: 300,
    installmentAmount: 300,
    remainingInstallments: 0,
    paidInstallments: 1,
    totalPaidAmount: 300
  }
]);

// Computed properties
const filteredStudents = computed(() => {
  if (!searchQuery.value) return [];
  
  const query = searchQuery.value.toLowerCase();
  return students.value
    .filter(student => {
      const nameMatch = student.name.toLowerCase().includes(query);
      const codeMatch = student.code.toString().includes(searchQuery.value);
      return nameMatch || codeMatch;
    })
    .slice(0, 10)
    .map(student => `${student.name} (${student.code})`);
});

const availableEvents = computed(() => {
  return events.value.filter(event => event.isActive);
});

const eventTeams = computed(() => {
  if (!selectedEvent.value) return [];
  return teams.value.filter(team => team.eventId === selectedEvent.value?.id);
});

const totalBookedStudents = computed(() => {
  if (!selectedEvent.value) return 0;
  return bookings.value.filter(booking => 
    booking.eventId === selectedEvent.value?.id && 
    booking.status === 'confirmed'
  ).length;
});

const availableSlots = computed(() => {
  if (!selectedEvent.value) return 0;
  const totalSlots = eventTeams.value.reduce((sum, team) => sum + team.maxCapacity, 0);
  return totalSlots - totalBookedStudents.value;
});

// Payment tracking computed properties
const getStudentPaymentHistory = (studentId: number, eventId: number) => {
  const booking = bookings.value.find(b => 
    b.studentId === studentId && 
    b.eventId === eventId && 
    b.status === 'confirmed'
  );
  
  if (!booking) return null;
  
  const payments = installmentPayments.value.filter(p => p.bookingId === booking.id);
  const totalPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidInstallments = payments.length;
  const remainingInstallments = booking.installmentType - paidInstallments;
  const isFullyPaid = paidInstallments >= booking.installmentType;
  
  return {
    bookingId: booking.id,
    studentId: booking.studentId,
    eventId: booking.eventId,
    teamId: booking.teamId,
    totalAmount: booking.totalAmount,
    installmentType: booking.installmentType,
    installmentAmount: booking.installmentAmount,
    totalPaidAmount,
    remainingInstallments,
    paidInstallments,
    payments,
    nextPaymentDue: isFullyPaid ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    isFullyPaid
  } as PaymentHistory;
};

const getPaymentStatus = (studentId: number, eventId: number) => {
  const history = getStudentPaymentHistory(studentId, eventId);
  if (!history) return null;
  
  if (history.isFullyPaid) {
    return { status: 'paid', text: 'Fully Paid', class: 'text-success' };
  } else if (history.paidInstallments > 0) {
    return { 
      status: 'partial', 
      text: `${history.paidInstallments}/${history.installmentType} Paid`, 
      class: 'text-warning' 
    };
  } else {
    return { status: 'unpaid', text: 'Unpaid', class: 'text-danger' };
  }
};

// Methods
const selectStudent = (suggestion: string) => {
  const match = suggestion.match(/\((\d+)\)$/);
  if (match) {
    const code = match[1];
    const student = students.value.find(s => s.code === code);
    if (student) {
      selectedStudent.value = student;
      selectedEvent.value = null;
      loadStudentBookings();
    }
  }
};

const handleEnterKey = () => {
  if (filteredStudents.value.length > 0) {
    selectStudent(filteredStudents.value[0]);
  }
};

const clearSelection = () => {
  selectedStudent.value = null;
  selectedEvent.value = null;
  selectedTeam.value = null;
  searchQuery.value = '';
};

const selectEvent = (event: Event) => {
  selectedEvent.value = event;
  loadEventTeams();
};

const getTeamStats = (team: Team) => {
  const maleCount = team.members.filter(m => m.gender === 'male').length;
  const femaleCount = team.members.filter(m => m.gender === 'female').length;
  const availableSlots = team.maxCapacity - team.currentMembers;
  
  return {
    totalMembers: team.currentMembers,
    maleCount,
    femaleCount,
    availableSlots
  };
};

const isStudentBooked = (teamId: number) => {
  if (!selectedStudent.value) return false;
  return bookings.value.some(booking => 
    booking.teamId === teamId && 
    booking.studentId === selectedStudent.value?.id &&
    booking.status === 'confirmed'
  );
};

const showTeamDetails = (team: Team) => {
  selectedTeam.value = team;
  showTeamDetailsFlag.value = true;
};

const closeTeamDetails = () => {
  showTeamDetailsFlag.value = false;
  selectedTeam.value = null;
};

const showPaymentHistory = (studentId: number, eventId: number) => {
  const history = getStudentPaymentHistory(studentId, eventId);
  if (history) {
    selectedPaymentHistory.value = history;
    showPaymentHistoryFlag.value = true;
  }
};

const closePaymentHistory = () => {
  showPaymentHistoryFlag.value = false;
  selectedPaymentHistory.value = null;
};

const recordPayment = async (bookingId: number, installmentNumber: number, amount: number, paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other', receiptNumber?: string, notes?: string) => {
  try {
    const newPayment: InstallmentPayment = {
      id: installmentPayments.value.length + 1,
      bookingId,
      installmentNumber,
      amount,
      paidAt: new Date().toISOString(),
      paymentMethod,
      receiptNumber,
      notes,
      status: 'completed'
    };
    
    installmentPayments.value.push(newPayment);
    
    // Update booking payment tracking
    const booking = bookings.value.find(b => b.id === bookingId);
    if (booking) {
      booking.paidInstallments++;
      booking.totalPaidAmount += amount;
      booking.remainingInstallments--;
    }
    
    return newPayment;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
};

const recordNewPayment = async () => {
  if (!selectedPaymentHistory.value || !newPaymentAmount.value) return;
  
  isRecordingPayment.value = true;
  try {
    const nextInstallmentNumber = selectedPaymentHistory.value.paidInstallments + 1;
    
    await recordPayment(
      selectedPaymentHistory.value.bookingId,
      nextInstallmentNumber,
      newPaymentAmount.value,
      newPaymentMethod.value,
      newPaymentReceipt.value || undefined,
      newPaymentNotes.value || undefined
    );
    
    // Update the selected payment history
    selectedPaymentHistory.value = getStudentPaymentHistory(
      selectedPaymentHistory.value.studentId,
      selectedPaymentHistory.value.eventId
    );
    
    // Clear form
    newPaymentAmount.value = 0;
    newPaymentReceipt.value = '';
    newPaymentNotes.value = '';
    
  } catch (error) {
    console.error('Error recording new payment:', error);
  } finally {
    isRecordingPayment.value = false;
  }
};

const handleInlineBooking = async (team: Team) => {
  if (!selectedStudent.value || !selectedEvent.value || selectedInstallments.value.length === 0) return;
  
  isBooking.value = true;
  try {
    // Calculate installment amounts
    const totalAmount = selectedEvent.value.price;
    let installmentAmount = totalAmount;
    let remainingInstallments = 0;
    
    if (selectedInstallments.value.length > 0) {
      installmentAmount = Math.ceil(totalAmount / selectedInstallments.value.length);
      remainingInstallments = selectedInstallments.value.length - 1;
    }
    
    const bookingData = {
      eventId: selectedEvent.value.id,
      teamId: team.id,
      studentId: selectedStudent.value.id,
      notes: bookingNotes.value || 'Inline booking',
      status: 'confirmed',
      installmentType: selectedInstallments.value.length,
      totalAmount: totalAmount,
      installmentAmount: installmentAmount,
      remainingInstallments: remainingInstallments
    };
    
    // Simulate API call for testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add to local bookings
    const newBooking: EventBooking = {
      id: bookings.value.length + 1,
      eventId: bookingData.eventId,
      teamId: bookingData.teamId,
      studentId: bookingData.studentId,
      notes: bookingData.notes,
      bookedAt: new Date().toISOString(),
      status: bookingData.status as 'confirmed' | 'pending' | 'cancelled',
      installmentType: bookingData.installmentType,
      totalAmount: bookingData.totalAmount,
      installmentAmount: bookingData.installmentAmount,
      remainingInstallments: bookingData.remainingInstallments,
      paidInstallments: 0,
      totalPaidAmount: 0
    };
    
    bookings.value.push(newBooking);
    
    // Update team member count
    const teamToUpdate = teams.value.find(t => t.id === team.id);
    if (teamToUpdate) {
      teamToUpdate.currentMembers++;
      teamToUpdate.members.push({
        id: teamToUpdate.members.length + 1,
        studentId: selectedStudent.value!.id,
        studentCode: selectedStudent.value!.code,
        studentName: selectedStudent.value!.name,
        gender: selectedStudent.value!.gender as 'male' | 'female',
        joinedAt: new Date().toISOString()
      });
    }
    
    // Clear notes and selected installments after successful booking
    bookingNotes.value = '';
    selectedInstallments.value = [];
    
  } catch (error) {
    console.error('Error with inline booking:', error);
  } finally {
    isBooking.value = false;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Data loading methods (commented out for testing with local data)
const loadStudents = async () => {
  // Using test data instead of API call
  console.log('Loading students from test data');
};

const loadEvents = async () => {
  // Using test data instead of API call
  console.log('Loading events from test data');
};

const loadEventTeams = async () => {
  // Using test data instead of API call
  console.log('Loading teams from test data');
};

const loadStudentBookings = async () => {
  // Using test data instead of API call
  console.log('Loading bookings from test data');
};

// Lifecycle
onMounted(() => {
  loadStudents();
  loadEvents();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Custom styles for better Bootstrap integration */
.card:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.modal.show {
  display: block !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 1rem;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}
</style> 