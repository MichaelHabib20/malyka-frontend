<template>
  <div class="container-fluid pt-4 px-0">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="row">
              <!-- Form Column (8 columns) -->
              <div class="col-md-8">
                <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
                  <!-- First Name Input -->
                  <div class="mb-2">
                    <Input
                      id="first-name"
                      v-model="formData.firstName"
                      :label="t('admins.form.firstName')"
                      :placeholder="t('admins.form.firstNamePlaceholder')"
                      :validation-rules="nameValidationRules"
                      @validation-change="handleFirstNameValidation"
                    />
                  </div>

                  <!-- Last Name Input -->
                  <div class="mb-2">
                    <Input
                      id="last-name"
                      v-model="formData.lastName"
                      :label="t('admins.form.lastName')"
                      :placeholder="t('admins.form.lastNamePlaceholder')"
                      :validation-rules="nameValidationRules"
                      @validation-change="handleLastNameValidation"
                    />
                  </div>

                  <!-- Email Input -->
                  <div class="mb-4">
                    <Input
                      id="email"
                      v-model="formData.email"
                      :label="t('admins.form.email')"
                      type="email"
                      :placeholder="t('admins.form.emailPlaceholder')"
                      leadingIcon="fa-regular fa-envelope"
                      :validation-rules="emailValidationRules"
                      @validation-change="handleEmailValidation"
                    />
                  </div>

                  <!-- Phone Number Input -->
                  <div class="mb-2">
                    <Input
                      id="phone"
                      v-model="formData.phoneNumber"
                      :label="t('admins.form.phoneNumber')"
                      :placeholder="t('admins.form.phoneNumberPlaceholder')"
                      leadingIcon="fa-solid fa-phone"
                      :validation-rules="phoneValidationRules"
                      @validation-change="handlePhoneValidation"
                    />
                  </div>

                  <!-- Password Input (only for create mode) -->
                  <div v-if="!isEditMode" class="mb-2">
                    <Input
                      id="password"
                      v-model="formData.password"
                      :label="t('admins.form.password')"
                      :type="passwordType"
                      :placeholder="t('admins.form.passwordPlaceholder')"
                      trailingIcon="fa-regular fa-eye"
                      :is-trailing-icon-clickable="true"
                      @trailing-icon-click="togglePasswordVisibility"
                      :validation-rules="passwordValidationRules"
                      @validation-change="handlePasswordValidation"
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
                      {{ isSubmitting ? t('admins.form.saving') : (isEditMode ? t('admins.form.updateAdmin') : t('admins.form.createAdmin')) }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Roles Column (4 columns) -->
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body">
                    <h6 class="card-title mb-3">
                      <i class="fas fa-user-tag me-2"></i>
                      {{ t('admins.form.roleAssignment') }}
                    </h6>
                    <Select
                      id="role"
                      v-model="formData.roleId"
                      :label="t('admins.form.role')"
                      :options="roleOptions"
                      :placeholder="t('admins.form.selectRole')"
                      :validation-rules="['required']"
                      @validation-change="handleRoleValidation"
                    />
                    <div class="mt-3">
                      <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        {{ t('admins.form.roleDescription') }}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
import Select from '../components/shared/select.vue'
import type { Role } from '../interfaces/roles'
import type { Admin } from '../interfaces/admin'

const { t } = useI18n();

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

interface ApiResponse<_T> {
  data: {
    roles?: Role[]
    admin?: Admin
  }
  httpStatus: number
  message: string
}

// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<Admin>({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  roleId: undefined
})

const roles = ref<Role[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const firstNameValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const lastNameValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const emailValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const phoneValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const passwordValidation = ref<ValidationResult>({ isValid: true, errors: [] })
const roleValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const passwordType = ref<'password' | 'text'>('password')

// Computed properties
const isEditMode = computed(() => route.name === 'EditAdmin')
const adminId = computed(() => route.params.id as string)

const isFormValid = computed(() => {
  const validations = [
    firstNameValidation.value.isValid,
    lastNameValidation.value.isValid,
    emailValidation.value.isValid,
    phoneValidation.value.isValid,
    roleValidation.value.isValid
  ]

  if (!isEditMode.value) {
    validations.push(passwordValidation.value.isValid)
  }

  return validations.every(v => v) &&
         formData.value.firstName.trim() !== '' &&
         formData.value.lastName.trim() !== '' &&
         formData.value.email.trim() !== '' &&
         formData.value.phoneNumber.trim() !== '' &&
         formData.value.roleId !== undefined &&
         (!isEditMode.value ? formData.value.password.trim() !== '' : true)
})

const roleOptions = computed(() => {
  return roles.value.map(role => ({
    label: role.name,
    value: role.id
  }))
})

// Validation rules
const nameValidationRules = computed(() => [
  'required',
  { type: 'minLength', params: 2, message: t('admins.validation.nameMinLength') },
  { type: 'maxLength', params: 50, message: t('admins.validation.nameMaxLength') }
])

const emailValidationRules = computed(() => [
  'required',
  'email'
])

const phoneValidationRules = computed(() => [
  'required',
  { 
    type: 'pattern', 
    params: [/^\d{11}$/], 
    message: t('admins.validation.phoneFormat') 
  }
])

const passwordValidationRules = computed(() => [
  'required',
  { type: 'minLength', params: 8, message: t('admins.validation.passwordMinLength') },
  { 
    type: 'pattern', 
    params: [/^(?=.*[A-Za-z])(?=.*\d).{8,}$/], 
    message: t('admins.validation.passwordPattern')
  }
])

// Methods
const togglePasswordVisibility = () => {
  passwordType.value = passwordType.value === 'password' ? 'text' : 'password'
}

const handleFirstNameValidation = (validation: ValidationResult) => {
  firstNameValidation.value = validation
}

const handleLastNameValidation = (validation: ValidationResult) => {
  lastNameValidation.value = validation
}

const handleEmailValidation = (validation: ValidationResult) => {
  emailValidation.value = validation
}

const handlePhoneValidation = (validation: ValidationResult) => {
  phoneValidation.value = validation
}

const handlePasswordValidation = (validation: ValidationResult) => {
  passwordValidation.value = validation
}

const handleRoleValidation = (validation: ValidationResult) => {
  roleValidation.value = validation
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const response : any= await dataService.fetchOnline<ApiResponse<Role[]>>('/api/Admin/GetRolesList')
    if (response && response.data && response.data.roles) {
      roles.value = response.data.roles
    }
  } catch (error) {
    dataService.createAlertMessage(t('admins.errors.loadRolesFailed'), 'error')
  } finally {
    loading.value = false
  }
}

const fetchAdmin = async () => {
  if (!isEditMode.value || !adminId.value) return
  
  try {
    const response : any = await dataService.fetchOnline<ApiResponse<Admin>>(`/api/Admin/GetContactById/${adminId.value}`)
    if (response && response.data && response.data.contact) {
      const admin = response.data.contact
      formData.value = {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        password: '',
        roleId: admin.roleId
      }
    }
  } catch (error) {
    dataService.createAlertMessage(t('admins.errors.loadAdminFailed'), 'error')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    let payload : any = {
      FirstName: formData.value.firstName.trim(),
      LastName: formData.value.lastName.trim(),
      Email: formData.value.email.trim(),
      PhoneNumber: formData.value.phoneNumber.trim(),
      Password: !isEditMode.value ? formData.value.password.trim() : undefined,
      RoleId: formData.value.roleId,
    }

    
    let response
    if (isEditMode.value) {
      payload.id = Number(adminId.value)
      payload.Password = 'undefined'
      response = await dataService.createOnline(`/api/Admin/UpdateUser`, payload)
    } else {
      response = await dataService.createOnline('/api/Admin/AddUser', payload)
    }

    if (response && (response.httpStatus === 200 || response.httpStatus === 201)) {
      dataService.createAlertMessage(response.message, 'success')
      router.push('/adminstrations/admins')
    } else {
      throw new Error(t('admins.errors.saveFailed'))
    }
  } catch (error) {
    dataService.createAlertMessage(isEditMode.value ? t('admins.errors.updateFailed') : t('admins.errors.createFailed'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/adminstrations/admins')
}

// Lifecycle
onMounted(async () => {
  await fetchRoles()
  if (isEditMode.value) {
    await fetchAdmin()
  }
})
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
}
</style>