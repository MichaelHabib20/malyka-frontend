<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
              <!-- Role Name Input -->
              <div class="mb-4">
                <Input
                  id="role-name"
                  v-model="formData.name"
                  label="Role Name"
                  placeholder="Enter role name"
                  :validation-rules="nameValidationRules"
                  @validation-change="handleNameValidation"
                />
              </div>

              <!-- Permissions Section -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="mb-0 fw-semibold text-dark">Permissions</h5>
                  <div class="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm"
                      @click="toggleSelectAll"
                    >
                      <i class="fas fa-check-square me-1"></i>
                      {{ isAllSelected ? 'Deselect All' : 'Select All' }}
                    </button>
                    <span class="text-muted small">
                      {{ selectedPermissions.length }} of {{ permissions.length }} selected
                    </span>
                  </div>
                </div>

                <!-- Search Permissions -->
                <div class="mb-3">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search permissions..."
                      v-model="permissionSearch"
                    />
                    <button
                      v-if="permissionSearch"
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="clearPermissionSearch"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-if="permissionSearch" class="mt-2">
                    <small class="text-muted">
                      Showing {{ filteredPermissions.length }} of {{ permissions.length }} permissions
                    </small>
                  </div>
                </div>

                <div v-if="loading" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2 text-muted">Loading permissions...</p>
                </div>

                <div v-else-if="permissions.length === 0" class="text-center py-4">
                  <i class="fas fa-exclamation-triangle text-warning fs-3 mb-2"></i>
                  <p class="text-muted">No permissions available</p>
                </div>

                <div v-else-if="filteredPermissions.length === 0" class="text-center py-4">
                  <i class="fas fa-search text-muted fs-3 mb-2"></i>
                  <p class="text-muted">No permissions found matching "{{ permissionSearch }}"</p>
                  <button
                    type="button"
                    class="btn btn-outline-primary btn-sm"
                    @click="clearPermissionSearch"
                  >
                    Clear Search
                  </button>
                </div>

                <div v-else class="border rounded p-3" style="max-height: 400px; overflow-y: auto;">
                  <div class="row g-2">
                    <div
                      v-for="permission in filteredPermissions"
                      :key="permission.id"
                      class="col-12 col-md-6 col-lg-4"
                    >
                      <div
                        class="permission-item p-2 border rounded cursor-pointer"
                        :class="{ 'border-primary bg-light': isPermissionSelected(permission.id) }"
                        @click="togglePermission(permission.id)"
                      >
                        <div class="form-check d-flex align-items-center">
                          <input
                            type="checkbox"
                            :id="`permission-${permission.id}`"
                            :checked="isPermissionSelected(permission.id)"
                            @change="togglePermission(permission.id)"
                            class="form-check-input me-2"
                          />
                          <label :for="`permission-${permission.id}`" class="form-check-label mb-0 flex-grow-1">
                            {{ permission.name }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="permissionsError" class="alert alert-danger mt-3">
                  <i class="fas fa-exclamation-circle me-2"></i>
                  {{ permissionsError }}
                </div>
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
                  {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Role' : 'Create Role') }}
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
import type { Permission } from '../interfaces/permission'
import type { FormData, ValidationResult, Role } from '../interfaces/permission'


// Route and Router
const route = useRoute()
const router = useRouter()

// Reactive data
const formData = ref<FormData>({
  name: '',
  permissions: []
})

const permissions = ref<Permission[]>([])
const loading = ref(false)
const isSubmitting = ref(false)
const permissionsError = ref('')
const submitMessage = ref('')
const nameValidation = ref<ValidationResult>({ isValid: false, errors: [] })
const permissionSearch = ref('')

// Computed properties
const isEditMode = computed(() => route.name === 'EditRole')
const roleId = computed(() => route.params.id as string)

const isFormValid = computed(() => {
  return nameValidation.value.isValid && 
         formData.value.name.trim() !== '' && 
         formData.value.permissions.length > 0
})

const selectedPermissions = computed(() => {
  return permissions.value.filter(p => formData.value.permissions.includes(p.id))
})

const isAllSelected = computed(() => {
  return permissions.value.length > 0 && 
         formData.value.permissions.length === permissions.value.length
})

const filteredPermissions = computed(() => {
  if (!permissionSearch.value) return permissions.value
  return permissions.value.filter(p => p.name.toLowerCase().includes(permissionSearch.value.toLowerCase()))
})

// Validation rules
const nameValidationRules = [
  'required',
  { type: 'minLength', params: 2, message: 'Role name must be at least 2 characters' },
  { type: 'maxLength', params: 50, message: 'Role name must be less than 50 characters' }
]

// Methods
const handleNameValidation = (validation: ValidationResult) => {
  nameValidation.value = validation
}

const isPermissionSelected = (permissionId: number): boolean => {
  return formData.value.permissions.includes(permissionId)
}

const togglePermission = (permissionId: number) => {
  const index = formData.value.permissions.indexOf(permissionId)
  if (index > -1) {
    formData.value.permissions.splice(index, 1)
  } else {
    formData.value.permissions.push(permissionId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    formData.value.permissions = []
  } else {
    formData.value.permissions = permissions.value.map(p => p.id)
  }
}

const fetchPermissions = async () => {
  loading.value = true
  permissionsError.value = ''
  
  try {
    const response : any = await dataService.fetchOnline<Permission[]>('/api/Admin/GetPermissionsList')
    if (response && response.data) {
      permissions.value = response.data.roles || response.data || []
    } else {
      throw new Error('Failed to load permissions')
    }
  } catch (error) {
    permissionsError.value = 'Failed to load permissions. Please try again.'
  } finally {
    loading.value = false
  }
}

const fetchRole = async () => {
  if (!isEditMode.value || !roleId.value) return
  
  try {
    const response : any = await dataService.fetchOnline<Role>(`/api/Admin/GetRoleById/${roleId.value}`)
    if (response && response.data) {
      const role = response.data.role
      formData.value = {
        name: role.name || '',
        permissions: role.permissions ? role.permissions.map((p: any) => p.permissionId) : []
      }
    }
  } catch (error) {
    dataService.createAlertMessage('Failed to load role data', 'error')
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    const payload : any= {
    RoleName: formData.value.name.trim(),
    PermissionId: formData.value.permissions
    }
    if(isEditMode.value){
      payload.RoleId = roleId.value
    }
    
    let response : any
    if (isEditMode.value) {
      response = await dataService.createOnline(`/api/Admin/UpdateRole`, payload)
    } else {
      response = await dataService.createOnline('/api/Admin/AddRole', payload)
    }
    if (response && (response.httpStatus === 200 || response.httpStatus === 201)) {
        dataService.createAlertMessage(response.message, 'success')
      router.push('/adminstrations/roles')
    } else {
      throw new Error('Failed to save role')
    }
  } catch (error) {
    dataService.createAlertMessage(isEditMode.value ? 'Failed to update role' : 'Failed to create role', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  router.push('/adminstrations/roles')
}

const clearPermissionSearch = () => {
  permissionSearch.value = ''
}

// Lifecycle
onMounted(async () => {
  await fetchPermissions()
  if (isEditMode.value) {
    await fetchRole()
  }
})

// Watch for form changes to clear messages
watch([() => formData.value.name, () => formData.value.permissions], () => {
  if (submitMessage.value) {
    submitMessage.value = ''
  }
})
</script>

<style scoped>
.container-fluid {
  max-width: 1200px;
  /* padding-left: 0;
  padding-right: 0; */
}
.permission-item {
  transition: all 0.2s ease;
}

.permission-item:hover {
  background-color: #f8f9fa !important;
  border-color: #0d6efd !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Custom scrollbar for permissions container */
.border.rounded.p-3::-webkit-scrollbar {
  width: 6px;
}

.border.rounded.p-3::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.border.rounded.p-3::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.border.rounded.p-3::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 