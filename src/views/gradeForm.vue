<template>
  <div class="container-fluid pt-4 px-0">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <!-- Grade Name Input -->
              <div class="mb-4">
                <Input
                  id="grade-name"
                  v-model="formData.name"
                  :label="t('grades.form.gradeName')"
                  :placeholder="t('grades.form.gradeNamePlaceholder')"
                  leadingIcon="fa-solid fa-graduation-cap"
                  :validation-rules="nameValidationRules"
                  @validation-change="handleNameValidation"
                />
              </div>


              <!-- Form Actions -->
              <div class="d-flex justify-content-end gap-2 pt-3 border-top">
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
                  {{ isSubmitting ? t('grades.form.saving') : (isEditMode ? t('grades.form.updateGrade') : t('grades.form.createGrade')) }}
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dataService } from '../services/dataContext'
import Input from '../components/shared/input.vue'
import type { Grade } from '../interfaces/grade'

const { t } = useI18n();

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface ApiResponse<T> {
  data: {
    grade?: Grade
  }
  httpStatus: number
  message: string
}

// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<Grade>({
  id: 0,
  name: ''
})

const loading = ref(false)
const isSubmitting = ref(false)
const nameValidation = ref<ValidationResult>({ isValid: false, errors: [] })

// Computed properties
const isEditMode = computed(() => route.name === 'EditGrade')
const gradeId = computed(() => route.params.id as string)

const isFormValid = computed(() => {
  return nameValidation.value.isValid &&
         formData.value.name.trim() !== ''
})

// Validation rules
const nameValidationRules = computed(() => [
  'required',
  { type: 'minLength', params: 2, message: t('grades.validation.nameMinLength') },
  { type: 'maxLength', params: 100, message: t('grades.validation.nameMaxLength') }
])

// Methods
const handleNameValidation = (validation: ValidationResult) => {
  nameValidation.value = validation
}

const fetchGrade = async () => {
  if (!isEditMode.value || !gradeId.value) return
  
  try {
    const response: any = await dataService.fetchOnline<ApiResponse<Grade>>(`/api/Grades/GetGradeById/${gradeId.value}`)
    if (response && response.data && response.data) {
      const grade = response.data
      formData.value = {
        id: grade.grade.id,
        name: grade.grade.name
          }
    }
  } catch (error) {
    dataService.createAlertMessage(t('grades.errors.loadGradeFailed'), 'error')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    let payload: any = {
      Name: formData.value.name.trim(),
    }

    let response
    if (isEditMode.value) {
      payload.Id = Number(gradeId.value)
      response = await dataService.createOnline('/api/Grades/UpdateGrade', payload)
    } else {
      response = await dataService.createOnline('/api/Grades/CreateGrade', payload)
    }

    if (response && (response.httpStatus === 200 || response.httpStatus === 201)) {
      dataService.createAlertMessage(response.message, 'success')
      router.push('/grade-levels/grades')
    } else {
      throw new Error(t('grades.errors.saveFailed'))
    }
  } catch (error) {
    dataService.createAlertMessage(isEditMode.value ? t('grades.errors.updateFailed') : t('grades.errors.createFailed'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/grade-levels/grades')
}

// Lifecycle
onMounted(async () => {
  if (isEditMode.value) {
    await fetchGrade()
  }
})
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>