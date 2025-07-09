<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <div class="row">
                <!-- Main Form Section (8 columns) -->
                <div class="col-lg-8">
                  <h5 class="mb-4 text-primary">
                    <i class="fa-solid fa-user-graduate me-2"></i>
                    Student Information
                  </h5>
                  
                  <!-- Basic Information Row -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3" v-if="!isRegisterMode">
                        <Input
                          id="student-code"
                          v-model="formData.code"
                          label="Student Code"
                          placeholder="Enter student code"
                          leadingIcon="fa-solid fa-id-card"
                          :validation-rules="['required', 'noConsecutiveSpaces']"
                          @validation-change="handleCodeValidation"
                        />
                      </div>
                      <div class="mb-3" v-else>
                        <Input
                          id="student-code"
                          v-model="formData.verificationCode"
                          label="Verification Code"
                          placeholder="Enter verification code"
                          leadingIcon="fa-solid fa-id-card"
                          :validation-rules="['required', 'noConsecutiveSpaces']"
                          @validation-change="handleCodeValidation"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="student-name"
                          v-model="formData.name"
                          label="Student Name"
                          placeholder="Enter student name"
                          leadingIcon="fa-solid fa-user"
                          :validation-rules="nameValidationRules"
                          @validation-change="handleNameValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Personal Information Row -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="national-id"
                          v-model="formData.nationalId"
                          label="National ID"
                          placeholder="Enter national ID"
                          leadingIcon="fa-solid fa-id-badge"
                          :validation-rules="['required', 'idOrPhone', 'noEnglishLetters']"
                          @validation-change="handleNationalIdValidation"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Select
                          id="gender-select"
                          v-model="formData.gender"
                          label="Gender"
                          :options="genderOptions"
                          placeholder="Select gender"
                          :validation-rules="['required']"
                          @validation-change="handleGenderValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Birth Information Row -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="birth-date"
                          v-model="formData.birthDate"
                          label="Birth Date"
                          type="date"
                          placeholder="Select birth date"
                          leadingIcon="fa-solid fa-calendar"
                          :validation-rules="['required']"
                          @validation-change="handleBirthDateValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Academic Information Row -->
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
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
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Select
                          id="class-select"
                          v-model="formData.classId"
                          label="Class"
                          :options="classOptions"
                          placeholder="Select class"
                          :validation-rules="['required']"
                          @validation-change="handleClassValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Contact Information Section -->
                  <h6 class="mb-3 text-secondary mt-4">
                    <i class="fa-solid fa-phone me-2"></i>
                    Contact Information
                  </h6>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="whatsapp-number"
                          v-model="formData.whatsapp"
                          :validation-rules="phoneValidationRules"
                          label="Whatsapp Number"
                          placeholder="Enter whatsapp number"
                          leadingIcon="fa-solid fa-phone"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="mother-mobile"
                          v-model="formData.momMob"
                          label="Mother Mobile"
                          placeholder="Enter mother's mobile"
                          leadingIcon="fa-solid fa-mobile-alt"
                          :validation-rules="phoneValidationRules"
                          @validation-change="handleMotherMobileValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="father-mobile"
                          v-model="formData.dadMob"
                          label="Father Mobile"
                          placeholder="Enter father's mobile"
                          leadingIcon="fa-solid fa-mobile-alt"
                          :validation-rules="phoneValidationRules"
                          @validation-change="handleFatherMobileValidation"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Address Information Section -->
                  <h6 class="mb-3 text-secondary mt-4">
                    <i class="fa-solid fa-map-marker-alt me-2"></i>
                    Address Information
                  </h6>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="main-street"
                          v-model="formData.mainStreet"
                          label="Main Street"
                          placeholder="Enter main street"
                          :validation-rules="['required', 'noEnglishLetters']"
                          leadingIcon="fa-solid fa-road"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <Input
                          id="sub-street"
                          v-model="formData.sideStreet"
                          label="Sub Street"
                          placeholder="Enter Sub street"
                          :validation-rules="['noEnglishLetters']"
                          leadingIcon="fa-solid fa-road"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-4">
                      <div class="mb-3">
                        <Input
                          id="area"
                          v-model="formData.area"
                          label="Area"
                          placeholder="Enter area"
                          :validation-rules="['required', 'noEnglishLetters']"
                          leadingIcon="fa-solid fa-map-marker-alt"
                        />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <Input
                          id="floor"
                          v-model="formData.floor"
                          label="Floor"
                          placeholder="Enter floor"
                          :validation-rules="['required', 'noEnglishLetters']"
                          leadingIcon="fa-solid fa-building"
                        />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <Input
                          id="apartment"
                          v-model="formData.apartmentNumber"
                          label="Apartment"
                          placeholder="Enter apartment"
                          leadingIcon="fa-solid fa-home"
                          :validation-rules="['required', 'noEnglishLetters']"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sidebar Section (4 columns) -->
                <div class="col-lg-4">
                  <div class="card border-0 bg-light">
                    <div class="card-body">
                      <h6 class="mb-3 text-secondary">
                        <i class="fa-solid fa-info-circle me-2"></i>
                        Additional Information
                      </h6>

                      <!-- Student Photo Upload -->
                      <div class="mb-4">
                        <ImageUploader
                          v-model="formData.photo"
                          id="student-photo"
                          label="Student Photo"
                          :max-size="2 * 1024 * 1024"
                          :min-width="200"
                          :min-height="200"
                          :max-width="800"
                          :max-height="800"
                          upload-title="Upload Student Photo"
                          upload-subtitle="JPG, PNG or WebP format, square aspect ratio recommended"
                          :show-image-info="true"
                          :compact="true"
                          help-text="Maximum 2MB, minimum 200x200px, maximum 800x800px"
                          @validation-change="handlePhotoValidation"
                          @file-selected="handlePhotoSelected"
                          @file-removed="handlePhotoRemoved"
                        />
                      </div>

                      <!-- Siblings Toggle -->
                      <div class="mb-4" v-if="!isRegisterMode">
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="siblings"
                            v-model="formData.siblings"
                          />
                          <label class="form-check-label" for="siblings" >
                            <i class="fa-solid fa-users me-2"></i>
                            Brothers
                          </label>
                        </div>
                        <small class="form-text text-muted">
                          Check if the student is brothers 
                        </small>
                      </div>

                      <!-- Notes Input -->
                      <div class="mb-4">
                        <label for="notes" class="form-label">
                          <i class="fa-solid fa-sticky-note me-2"></i>
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          v-model="formData.landmark"
                          class="form-control"
                          rows="6"
                          placeholder="Enter additional notes about the student..."
                        ></textarea>
                        <small class="form-text text-muted">
                          Any additional information or special requirements
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="d-flex justify-content-end gap-2 pt-4 border-top mt-4">
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
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Student' : 'Create Student') }}
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
import { dataService } from '../services/dataContext'
import Input from '../components/shared/input.vue'
import Select from '../components/shared/select.vue'
import ImageUploader from '../components/shared/imageUploader.vue'
import type { Student } from '../interfaces/student'
import type { Grade } from '../interfaces/grade'
import type { Class } from '../interfaces/class'

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface ApiResponse<T> {
  data: {
    student?: Student
    grades?: Grade[]
    classes?: Class[]
  }
  httpStatus: number
  statusCode: number
  message: string
}

interface StudentFormData {
  id: number
  code: string
  verificationCode?: string | undefined
  name: string
  number: string
  sideStreet: string
  mainStreet: string
  area: string
  floor: string
  apartmentNumber: string
  landmark: string
  whatsapp: string
  momMob: string
  dadMob: string
  birthDate: string
  siblings: boolean
  gender: string
  nationalId: string
  gradeId?: number
  classId?: number
  photo?: File | string,
  fullAddress?: string,
  isNew?: boolean
}

// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<StudentFormData>({
  id: 0,
  code: '',
  verificationCode: '',
  name: '',
  number: '',
  sideStreet: '',
  mainStreet: '',
  area: '',
  floor: '',
  apartmentNumber: '',
  landmark: '',
  whatsapp: '',
  momMob: '',
  dadMob: '',
  birthDate: '',
  siblings: false,
  gender: '',
  nationalId: '',
  gradeId: undefined,
  classId: undefined,
  photo: undefined
})

const grades = ref<Grade[]>([])
const classes = ref<Class[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const isRegisterMode = computed(() => route.name === 'register')
const isNeedToResetClassId = ref(true)

// Validation states
const codeValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const nameValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const nationalIdValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const genderValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const birthDateValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const gradeValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const classValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const motherMobileValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const fatherMobileValidation = ref<ValidationResult>({ isValid: false, errors: [] })

// Computed properties
const isEditMode = computed(() => route.name === 'EditStudent')
const studentId = computed(() => route.params.id as string)
const gradeId = computed(() => formData.value.gradeId )

const isFormValid = computed(() => {
  const validations = [
    nameValidation.value.isValid,
    nationalIdValidation.value.isValid,
    genderValidation.value.isValid,
    birthDateValidation.value.isValid,
    gradeValidation.value.isValid,
    classValidation.value.isValid
  ]

  return validations.every(v => v) &&
         formData.value.name?.trim() !== '' &&
         formData.value.nationalId?.trim() !== '' &&
         formData.value.gender !== '' &&
         formData.value.birthDate !== '' &&
         formData.value.gradeId !== undefined &&
         formData.value.classId !== undefined
})

const genderOptions = computed(() => [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
])

const gradeOptions = computed(() => {
  return grades.value.map((grade : any)=> ({
    label: grade.grade.name,
    value: grade.grade.id
  }))
})

const classOptions = computed(() => {
  return classes.value.map((cls : any)=> ({
    label: cls.name,
    value: cls.id
  }))
})

// Validation rules
const nameValidationRules = [
  'required',
  'fourWords',
  'noEnglishLetters',
  { type: 'minLength', params: 2, message: 'Name must be at least 2 characters' },
  { type: 'maxLength', params: 100, message: 'Name must be less than 100 characters' },
  
]

const phoneValidationRules = [
  'noEnglishLetters',
  { 
    type: 'pattern', 
    params: [/^\d{11}$/], 
    message: 'Phone number must be 11 digits' 
  }
]

// Methods
const handleCodeValidation = (validation: ValidationResult) => {
  codeValidation.value = validation
}

const handleNameValidation = (validation: ValidationResult) => {
  nameValidation.value = validation
}

const handleNationalIdValidation = (validation: ValidationResult) => {
  nationalIdValidation.value = validation
}

const handleGenderValidation = (validation: ValidationResult) => {
  genderValidation.value = validation
}

const handleBirthDateValidation = (validation: ValidationResult) => {
  birthDateValidation.value = validation
}

const handleGradeValidation = (validation: ValidationResult) => {
  gradeValidation.value = validation
}

const handleClassValidation = (validation: ValidationResult) => {
  classValidation.value = validation
}

const handleMotherMobileValidation = (validation: ValidationResult) => {
  motherMobileValidation.value = validation
}

const handleFatherMobileValidation = (validation: ValidationResult) => {
  fatherMobileValidation.value = validation
}

const handlePhotoValidation = (validation: ValidationResult) => {
  if (!validation.isValid) {
    dataService.createAlertMessage(`Photo validation failed: ${validation.errors.join(', ')}`, 'warning')
  }
}

const handlePhotoSelected = (file: File) => {
}

const handlePhotoRemoved = () => {
  formData.value.photo = undefined
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

const fetchClasses = async () => {
  loading.value = true
  try {
    const response: any = await dataService.fetchOnline<ApiResponse<Class[]>>('/api/Grades/GetClasses')
    if (response && response.data && response.data) {
      classes.value = response.data
    }
  } catch (error) {
    dataService.createAlertMessage('Failed to load classes', 'error')
  } finally {
    loading.value = false
  }
}

const fetchStudent = async () => {
  if (!isEditMode.value || !studentId.value) return
  
  try {
    const response: any = await dataService.fetchOnline<ApiResponse<Student>>(`/api/KidsRegistration/GetKidById/${studentId.value}`)
      console.log(response)
    if (response && response.data) {
      const student : Student  = response.data.kid
      isNeedToResetClassId.value = false
      formData.value = {
        id: student.id,
        code: student.code,
        verificationCode: student.verificationCode,
        name: student.name,
        number: student.number,
        sideStreet: student.sideStreet,
        mainStreet: student.mainStreet,
        area: student.area,
        floor: student.floor,
        apartmentNumber: student.apartmentNumber,
        landmark: student.landmark || '',
        whatsapp: student.whatsapp,
        momMob: student.momMob,
        dadMob: student.dadMob,
        birthDate: formatDateForInput(student.birthDate),
        siblings: student.siblings,
        gender: student.gender,
        nationalId: student.nationalId,
        gradeId: student.gradeId,
        classId: student.classId,
        photo: student.photo,
        fullAddress: student.fullAddress,
        isNew: student.isNew
      }
      // if(student.gradeId){
      //   handleGetClassesByGradeId(student.gradeId)
      // }
    }
  } catch (error) {
    dataService.createAlertMessage('Failed to load student data', 'error')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    let payload: any = {
      Code: formData.value.code,
      RegistrationCode : formData.value.verificationCode,
      KidName : formData.value.name,
      Number: formData.value.number,
      SideStreet: formData.value.sideStreet,
      MainStreet : formData.value.mainStreet,
      Area: formData.value.area,
      Floor : formData.value.floor,
      ApartmentNumber: formData.value.apartmentNumber,
      landmark: formData.value.landmark,
      Whatsapp : formData.value.whatsapp,
      MomMob : formData.value.momMob,
      DadMob : formData.value.dadMob,
      BirthDate : formData.value.birthDate,
      Siblings: formData.value.siblings,
      Gender: formData.value.gender,
      NationalId : formData.value.nationalId,
      GradeId: formData.value.gradeId,
      ClassId: formData.value.classId
    }
    // Handle photo upload
    // if (formData.value.photo instanceof File) {
    //   // Convert file to base64 for API submission
    //   const base64 = await fileToBase64(formData.value.photo)
    //   payload.Photo = base64
    // } else if (typeof formData.value.photo === 'string') {
    //   // If it's already a string (base64 or URL), use it directly
    //   payload.Photo = formData.value.photo
    // }

    let response
    if (isEditMode.value) {
      payload.Id = Number(studentId.value)
      response = await dataService.createOnline(`/api/KidsRegistration/UpdateKid/${studentId.value}`, payload)
    } else {
      response  = await dataService.createOnline('/api/KidsRegistration/RegisterKid', payload)
    }
    console.log(response)
    if (response && (response.statusCode === 200 || response.httpStatus === 200)) {
      dataService.createAlertMessage(response.message, 'success')
      router.push('/students')
    } else {
      dataService.createAlertMessage(response?.message!, 'error')
      router.push('/students')

    }
  } catch (error) {
    dataService.createAlertMessage(isEditMode.value ? 'Failed to update student' : 'Failed to create student', 'error')
  } finally {
    isSubmitting.value = false
  }
}
const handleGetClassesByGradeId = async (gradeId: number) => {
  const response: any = await dataService.fetchOnline<ApiResponse<Class[]>>(`/api/Grades/GetClassByGradeId/${gradeId}`)
  if (response && response.data) {
    classes.value = response.data
    console.log(classes.value)
  }
}

// Watch for grade ID changes and fetch corresponding classes
watch(() => formData.value.gradeId, async (newGradeId, oldGradeId) => {
  if (newGradeId && newGradeId !== oldGradeId) {
    if(oldGradeId){
      isNeedToResetClassId.value = true
    }
    await handleGetClassesByGradeId(newGradeId)
    // Reset class selection when grade changes
    if(isNeedToResetClassId.value){
      formData.value.classId = undefined
    }
  } else if (!newGradeId) {
    // Clear classes when no grade is selected
    classes.value = []
    if(isNeedToResetClassId.value){
      formData.value.classId = undefined
    }
  }
})

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

// Helper function to convert ISO date string to YYYY-MM-DD format for date input
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

const handleCancel = () => {
  router.push('/students')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchGrades(), fetchClasses()])
  if (isEditMode.value) {
    await fetchStudent()
  }
  if (gradeId.value) {
    await handleGetClassesByGradeId(gradeId.value)
  }
  // if(studentId.value){
  //   await fetchStudent()
  // }
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