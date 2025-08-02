<template>
  <div class="container-fluid pt-4 px-0">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header bg-white border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h3 class="h4 mb-1 text-dark">
                  {{ isEditMode ? t('verificationEmails.editTitle') : t('verificationEmails.createTitle') }}
                </h3>
                <p class="text-muted mb-0">
                  {{ isEditMode ? t('verificationEmails.editSubtitle') : t('verificationEmails.createSubtitle') }}
                </p>
              </div>
              <button
                class="btn btn-outline-secondary"
                @click="handleCancel"
                :disabled="isSubmitting"
              >
                <i class="fas fa-arrow-left me-1"></i>
                {{ t('app.back') }}
              </button>
            </div>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>

                              <!-- Grade Selection -->
              <div class="mb-4">
                <Select
                  id="grade-select"
                  v-model="formData.gradeId"
                  :label="t('verificationEmails.grade')"
                  :placeholder="t('verificationEmails.gradePlaceholder')"
                  :options="gradeOptions"
                  leadingIcon="fa-solid fa-graduation-cap"
                  :validation-rules="gradeValidationRules"
                  @validation-change="handleGradeValidation"
                />
              </div>


              <!-- Emails Array Section -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-start mb-4">
                    <label class="form-label fw-semibold text-dark">
                  <i class="fas fa-envelope me-2 text-primary"></i>
                  {{ t('verificationEmails.emails') }}
                  <span class="text-danger">*</span>
                </label>

                
                <!-- Add Email Button -->
                <div class="text-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="addEmail"
                  >
                    <i class="fas fa-plus me-2"></i>
                    {{ t('verificationEmails.addEmail') }}
                  </button>
                </div>
                </div>
                
                <div class="emails-container">
                  <div
                    v-for="(_email, index) in formData.emails"
                    :key="index"
                    class="email-item mb-3"
                  >
                    <div class="d-flex gap-2 align-items-start">
                      <div class="flex-grow-1">
                        <Input
                          :id="`email-${index}`"
                          v-model="formData.emails[index]"
                          :placeholder="t('verificationEmails.emailPlaceholder')"
                          type="email"
                          leadingIcon="fa-solid fa-envelope"
                          :validation-rules="emailValidationRules"
                          @validation-change="(result: ValidationResult) => handleEmailValidation(index, result)"
                        />
                      </div>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        @click="removeEmail(index)"
                        :disabled="formData.emails.length <= 1"
                        title="Remove email"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>


              </div>



              <!-- Form Actions -->
              <div class="d-flex justify-content-end gap-3 pt-4 border-top">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="handleCancel"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-times me-1"></i>
                  {{ t('app.cancel') }}
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isFormValid || isSubmitting"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-save me-1"></i>
                  {{ isSubmitting ? t('app.saving') : (isEditMode ? t('verificationEmails.update') : t('verificationEmails.create')) }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dataService } from '../services/dataContext'
import Input from '../components/shared/input.vue'
import Select from '../components/shared/select.vue'
import type { Grade } from '../interfaces/grade'

const { t } = useI18n()

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface VerificationEmailForm {
  id?: number
  emails: string[]
  gradeId: number
}

// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<VerificationEmailForm>({
  emails: [''],
  gradeId: 0
})

const isSubmitting = ref(false)
const grades = ref<Grade[]>([])
const loadingGrades = ref(false)
const emailValidations = ref<ValidationResult[]>([])
const gradeValidation = ref<ValidationResult>({ isValid: false, errors: [] })

// Computed properties
const isEditMode = computed(() => !!route.params.id)

const gradeOptions = computed(() => {
  return grades.value.map((grade: any) => ({
    label: grade.grade.name,
    value: grade.grade.id
  }))
})

const isFormValid = computed(() => {
  const hasValidEmails = formData.value.emails.length > 0 && 
    formData.value.emails.every(email => email.trim() !== '') &&
    emailValidations.value.every(validation => validation.isValid)
  
  const hasValidGrade = gradeValidation.value.isValid
  
  return hasValidEmails && hasValidGrade
})

// const emailValidationErrors = computed(() => {
//   const errors: string[] = []
  
//   if (formData.value.emails.length === 0) {
//     errors.push(t('verificationEmails.errors.atLeastOneEmail'))
//   }
  
//   if (formData.value.emails.some(email => email.trim() === '')) {
//     errors.push(t('verificationEmails.errors.emptyEmails'))
//   }
  
//   emailValidations.value.forEach((validation, index) => {
//     if (!validation.isValid) {
//       errors.push(`${t('verificationEmails.errors.email')} ${index + 1}: ${validation.errors.join(', ')}`)
//     }
//   })
  
//   return errors
// })

// Validation rules
const emailValidationRules = [
  { type: 'required', message: t('verificationEmails.errors.emailRequired') },
  { type: 'email', message: t('verificationEmails.errors.invalidEmail') }
]

const gradeValidationRules = [
  { type: 'required', message: t('verificationEmails.errors.gradeRequired') }
]

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

const loadVerificationEmail = async (id: string) => {
  try {
    const response = await dataService.get(`/verification-emails/${id}`)
    const data = response.data as any
    
    formData.value = {
      id: data.id,
      emails: data.emails || [''],
      gradeId: data.gradeId || 0
    }
  } catch (error) {
    console.error('Error loading verification email:', error)
    router.push('/verification-emails')
  }
}

const addEmail = () => {
  formData.value.emails.push('')
  emailValidations.value.push({ isValid: false, errors: [] })
}

const removeEmail = (index: number) => {
  if (formData.value.emails.length > 1) {
    formData.value.emails.splice(index, 1)
    emailValidations.value.splice(index, 1)
  }
}

const handleEmailValidation = (index: number, result: ValidationResult) => {
  emailValidations.value[index] = result
}

const handleGradeValidation = (result: ValidationResult) => {
  gradeValidation.value = result
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  try {
    isSubmitting.value = true
    
    // Filter out empty emails
    const cleanEmails = formData.value.emails.filter(email => email.trim() !== '')
    
    const payload = {
      emails: cleanEmails,
      gradeId: formData.value.gradeId
    }
    
    if (isEditMode.value) {
      await dataService.put(`/verification-emails/${formData.value.id}`, payload)
    } else {
      await dataService.post('/verification-emails', payload)
    }
    
    router.push('/verification-emails')
  } catch (error) {
    console.error('Error saving verification email:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/verification-emails')
}

// Watch for changes in emails array
watch(() => formData.value.emails, (newEmails) => {
  // Ensure we always have at least one email field
  if (newEmails.length === 0) {
    formData.value.emails = ['']
  }
  
  // Adjust validation array length
  while (emailValidations.value.length < newEmails.length) {
    emailValidations.value.push({ isValid: false, errors: [] })
  }
  while (emailValidations.value.length > newEmails.length) {
    emailValidations.value.pop()
  }
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await loadGrades()
  
  if (isEditMode.value && route.params.id) {
    await loadVerificationEmail(route.params.id as string)
  }
})
</script>

<style scoped>
.emails-container {
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f9fafb;
  max-height: 200px !important;
  overflow-y: scroll !important;
}

.email-item {
  position: relative;
}

.email-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.form-label {
  font-size: 1rem;
  color: #374151;
}

.alert {
  border-radius: 0.375rem;
  border: none;
}

.alert-danger {
  background-color: #fef2f2;
  color: #dc2626;
  border-left: 4px solid #dc2626;
}

.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.btn-primary {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-outline-primary {
  color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline-primary:hover {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-outline-danger {
  color: #dc2626;
  border-color: #dc2626;
}

.btn-outline-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

.card {
  border: none;
  border-radius: 0.5rem;
}

.card-header {
  border-radius: 0.5rem 0.5rem 0 0 !important;
}
</style>
