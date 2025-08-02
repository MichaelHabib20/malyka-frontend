<template>
  <div class="container pt-4 px-0">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="h3 mb-1 text-dark">{{ t('verificationEmails.title') }}</h2>
            <p class="text-muted mb-0">{{ t('verificationEmails.subtitle') }}</p>
          </div>
          <button
            class="btn btn-primary"
            @click="handleCreate"
          >
            <i class="fas fa-plus me-2"></i>
            {{ t('verificationEmails.create') }}
          </button>
        </div>

        <!-- Search and Filter Bar -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-6 mb-3 mb-md-0">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    class="form-control"
                    :placeholder="t('app.search')"
                    v-model="searchQuery"
                  />
                </div>
              </div>
              <div class="col-md-3 mb-3 mb-md-0">
                <select class="form-select" v-model="gradeFilter">
                  <option value="">{{ t('app.allGrades') }}</option>
                  <option
                    v-for="grade in uniqueGrades"
                    :key="grade?.grade?.id"
                    :value="grade?.grade?.id"
                  >
                    {{ grade?.grade?.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3 text-md-end">
                <button
                  class="btn btn-outline-secondary"
                  @click="refreshData"
                  :disabled="loading"
                >
                  <i class="fas fa-refresh me-1"></i>
                  {{ t('app.refresh') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ t('app.loading') }}</span>
          </div>
          <p class="mt-3 text-muted">{{ t('app.loading') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredEmails.length === 0" class="text-center py-5">
          <div class="p-4">
            <i class="fas fa-envelope-open fa-3x text-muted mb-3 opacity-50"></i>
            <h4 class="text-muted">{{ t('app.noData') }}</h4>
            <p class="text-muted">{{ t('app.noDataDescription') }}</p>
            <button class="btn btn-primary" @click="handleCreate">
              <i class="fas fa-plus me-2"></i>
              {{ t('verificationEmails.create') }}
            </button>
          </div>
        </div>

        <!-- Cards Grid -->
        <div v-else class="row g-4">
          <div
            v-for="item in paginatedEmails"
            :key="item.id"
            class="col-lg-4 col-md-6 col-sm-12"
          >
            <div class="card h-100 shadow-sm hover-card">
              <div class="card-body">
                <!-- Header with ID and Actions -->
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="d-flex align-items-center">
                    <div class="fw-semibold">
                      <span class="badge bg-primary">#{{ item.id }}</span>
                    </div>
                  </div>
                  <div class="dropdown">
                    <button
                      class="btn btn-link text-muted p-0"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <button
                          class="dropdown-item"
                          @click="handleEdit(item)"
                        >
                          <i class="fas fa-edit me-2"></i>
                          {{ t('app.edit') }}
                        </button>
                      </li>
                      <li>
                        <button
                          class="dropdown-item text-danger"
                          @click="handleDelete(item)"
                        >
                          <i class="fas fa-trash me-2"></i>
                          {{ t('app.delete') }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Grade Badge -->
                <div class="mb-3">
                  <span class="badge bg-info-subtle text-info fs-6">
                    <i class="fas fa-graduation-cap me-1"></i>
                    {{ item.grade?.name || t('app.notAssigned') }}
                  </span>
                </div>

                <!-- Email Addresses -->
                <div class="mb-3">
                  <h6 class="text-muted mb-2">
                    <i class="fas fa-envelope me-1"></i>
                    {{ t('verificationEmails.emails') }}
                  </h6>
                  <div class="email-list">
                    <div
                      v-for="email in item.emails"
                      :key="email"
                      class="email-item"
                    >
                      <i class="fas fa-envelope-open text-primary me-2"></i>
                      <span class="email-text">{{ email }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footer with Date -->
                <div class="card-footer bg-transparent border-0 px-0 pb-0">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(item.createdAt) }}
                    </small>
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="handleEdit(item)"
                    >
                      <i class="fas fa-edit me-1"></i>
                      {{ t('app.edit') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav aria-label="Pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link border-0"
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button
                  class="page-link border-0"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link border-0"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dataService } from '../services/dataContext'
import type { Grade } from '../interfaces/grade'

const { t } = useI18n()
const router = useRouter()

interface VerificationEmail {
  id: number
  emails: string[]
  gradeId: number
  grade?: {
    id: number
    name: string
    arName?: string
  }
  createdAt?: string
  updatedAt?: string
}

// Reactive data
const verificationEmails = ref<VerificationEmail[]>([])
const grades = ref<Grade[]>([])
const loading = ref(false)
const loadingGrades = ref(false)
const searchQuery = ref('')
const gradeFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(9)

// Computed properties
const filteredEmails = computed(() => {
  let filtered = verificationEmails.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.emails.some(email => email.toLowerCase().includes(query)) ||
      item.grade?.name?.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    )
  }

  // Grade filter
  if (gradeFilter.value) {
    filtered = filtered.filter(item => item.gradeId.toString() === gradeFilter.value)
  }

  return filtered
})

const uniqueGrades = computed(() => {
  return grades.value
})

const paginatedEmails = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEmails.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredEmails.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const loadGrades = async () => {
  try {
    loadingGrades.value = true
    const response = await dataService.get('/api/Grades/GetGrades')
    grades.value = (response.data as Grade[]) || []
  } catch (error) {
    console.error('Error loading grades:', error)
  } finally {
    loadingGrades.value = false
  }
}

const loadData = async () => {
  try {
    loading.value = true
    const response = await dataService.get('/verification-emails')
    verificationEmails.value = (response.data as VerificationEmail[]) || []
  } catch (error) {
    console.error('Error loading verification emails:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const handleCreate = () => {
  router.push('/verification-emails/create')
}

const handleEdit = (item: VerificationEmail) => {
  router.push(`/verification-emails/edit/${item.id}`)
}

const handleDelete = async (item: VerificationEmail) => {
  if (confirm(t('verificationEmails.confirmDelete'))) {
    try {
      await dataService.delete(`/verification-emails/${item.id}`)
      await loadData()
    } catch (error) {
      console.error('Error deleting verification email:', error)
    }
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadGrades()
  loadData()
})
</script>

<style scoped>
.container{
    max-width: 1200px !important;
}
/* Minimal custom CSS for effects that can't be achieved with Bootstrap utilities */
.hover-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.email-list {
  max-height: 120px;
  overflow-y: auto;
}

.email-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.email-item:last-child {
  border-bottom: none;
}

.email-text {
  font-size: 0.875rem;
  word-break: break-all;
}

.dropdown-menu {
  min-width: 120px;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.page-link {
  color: #6c757d;
  padding: 0.5rem 0.75rem;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #495057;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: transparent;
}
</style>
