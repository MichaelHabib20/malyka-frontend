<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <!-- Class Name Input -->
              <div class="mb-4">
                <Input
                  id="class-name"
                  v-model="formData.name"
                  label="Class Name"
                  placeholder="Enter class name"
                  leadingIcon="fa-solid fa-chalkboard"
                  :validation-rules="nameValidationRules"
                  @validation-change="handleNameValidation"
                />
              </div>

              <!-- Grade Select -->
              <div class="mb-4">
                <Select
                  id="grade-select"
                  v-model="formData.gradeId"
                  label="Grade"
                  :options="gradeOptions"
                  placeholder="Select grade"
                  :validation-rules="['required']"
                  @validation-change="handleGradeValidation"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!isFormValid || isSubmitting"
                >
                  <i v-if="isSubmitting" class="fas fa-spinner fa-spin me-1"></i>
                  <i v-else class="fas fa-save me-1"></i>
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Class' : 'Create Class') }}
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
import { dataService } from '../services/dataContext'
import Input from '../components/shared/input.vue'
import Select from '../components/shared/select.vue'
import type { Class } from '../interfaces/class'
import type { Grade } from '../interfaces/grade'

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface ApiResponse<T> {
  data: {
    class?: Class
    grades?: Grade[]
  }
  httpStatus: number
  message: string
}

// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<Class>({
  id: 0,
  name: '',
  gradeId: undefined
})

const grades = ref<Grade[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const nameValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const gradeValidation = ref<ValidationResult>({ isValid: false, errors: [] })

// Computed properties
const isEditMode = computed(() => route.name === 'EditClass')
const classId = computed(() => route.params.id as string)

const isFormValid = computed(() => {
  return nameValidation.value.isValid &&
         gradeValidation.value.isValid &&
         formData.value.name.trim() !== '' &&
         formData.value.gradeId !== undefined
})

const gradeOptions = computed(() => {
  return grades.value.map(grade => ({
    label: grade.name,
    value: grade.id
  }))
})

// Validation rules
const nameValidationRules = [
  'required',
  { type: 'minLength', params: 2, message: 'Class name must be at least 2 characters' },
  { type: 'maxLength', params: 100, message: 'Class name must be less than 100 characters' }
]

// Methods
const handleNameValidation = (validation: ValidationResult) => {
  nameValidation.value = validation
}

const handleGradeValidation = (validation: ValidationResult) => {
  gradeValidation.value = validation
}

const fetchGrades = async () => {
  loading.value = true
  try {
    const response: any = await dataService.fetchOnline<ApiResponse<Grade[]>>('/api/Grades/GetGrades')
    if (response && response.data && response.data) {
      grades.value = response.data
    }
  } catch (error) {
    dataService.createAlertMessage('Failed to load grades', 'error')
  } finally {
    loading.value = false
  }
}

const fetchClass = async () => {
  if (!isEditMode.value || !classId.value) return
  
  try {
    const response: any = await dataService.fetchOnline<ApiResponse<Class>>(`/api/Grades/GetClassById/${classId.value}`)
    if (response && response.data && response.data) {
      const classData = response.data
      console.log(classData)
      formData.value = {
        id: classData.id,
        name: classData.name,
        gradeId: classData.gradeId
      }
    }
  } catch (error) {
    dataService.createAlertMessage('Failed to load class data', 'error')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    let payload: any = {
      Name: formData.value.name.trim(),
      GradeId: formData.value.gradeId
    }

    let response
    if (isEditMode.value) {
      payload.ClassId = Number(classId.value)
      response = await dataService.createOnline('/api/Grades/UpdateClass', payload)
    } else {
      response = await dataService.createOnline('/api/Grades/CreateClass', payload)
    }

    if (response && (response.httpStatus === 200 || response.httpStatus === 201)) {
      dataService.createAlertMessage(response.message, 'success')
      router.push('/grade-levels/classes')
    } else {
      throw new Error('Failed to save class')
    }
  } catch (error) {
    dataService.createAlertMessage(isEditMode.value ? 'Failed to update class' : 'Failed to create class', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/grade-levels/classes')
}

// Lifecycle
onMounted(async () => {
  await fetchGrades()
  if (isEditMode.value) {
    await fetchClass()
  }
})
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
}
</style>