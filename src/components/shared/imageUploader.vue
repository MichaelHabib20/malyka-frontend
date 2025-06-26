<template>
  <div class="image-uploader-wrapper" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id" class="image-uploader-label">{{ label }}</label>
    
    <div 
      class="image-uploader-container"
      :class="[
        { 'is-dragover': isDragOver },
        { 'has-image': hasImage },
        { 'is-disabled': disabled },
        { 'is-compact': compact }
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter.prevent
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        :id="id"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        class="hidden-input"
        @change="handleFileSelect"
      />
      
      <!-- Upload area content -->
      <div v-if="!hasImage" class="upload-area">
        <div class="upload-icon">
          <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <div class="upload-text">
          <p class="upload-title">{{ uploadTitle }}</p>
          <p class="upload-subtitle">{{ uploadSubtitle }}</p>
        </div>
        <button 
          type="button"
          class="upload-button"
          :disabled="disabled"
          @click="triggerFileSelect"
        >
          {{ buttonText }}
        </button>
      </div>
      
      <!-- Image preview area -->
      <div v-else class="image-preview-area">
        <div class="image-preview-container">
          <img 
            v-if="previewUrl" 
            :src="previewUrl" 
            :alt="imageAlt"
            class="image-preview"
            @load="handleImageLoad"
            @error="handleImageError"
          />
          <div v-else class="image-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
          </div>
        </div>
        
        <!-- Image actions -->
        <div class="image-actions">
          <button 
            v-if="showReplaceButton"
            type="button"
            class="action-button replace-button"
            :disabled="disabled"
            @click="triggerFileSelect"
            :title="replaceButtonText"
          >
            <i class="fas fa-edit"></i>
            <span v-if="!compact">{{ replaceButtonText }}</span>
          </button>
          
          <button 
            v-if="showRemoveButton"
            type="button"
            class="action-button remove-button"
            :disabled="disabled"
            @click="removeImage"
            :title="removeButtonText"
          >
            <i class="fas fa-trash"></i>
            <span v-if="!compact">{{ removeButtonText }}</span>
          </button>
          
          <button 
            v-if="showViewButton && previewUrl"
            type="button"
            class="action-button view-button"
            @click="viewImage"
            :title="viewButtonText"
          >
            <i class="fas fa-eye"></i>
            <span v-if="!compact">{{ viewButtonText }}</span>
          </button>
        </div>
        
        <!-- Image info -->
        <div v-if="showImageInfo && selectedFile" class="image-info">
          <div class="info-item">
            <span class="info-label">Name:</span>
            <span class="info-value">{{ selectedFile.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Size:</span>
            <span class="info-value">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <div v-if="imageDimensions" class="info-item">
            <span class="info-label">Dimensions:</span>
            <span class="info-value">{{ imageDimensions.width }} × {{ imageDimensions.height }}</span>
          </div>
        </div>
      </div>
      
      <!-- Progress bar for upload -->
      <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ Math.round(uploadProgress) }}%</span>
      </div>
    </div>
    
    <!-- Error message -->
    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
    
    <!-- Help text -->
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const fileInputRef = ref(null)

const props = defineProps({
  modelValue: {
    type: [File, FileList, null],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    required: true
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  maxWidth: {
    type: Number,
    default: null
  },
  maxHeight: {
    type: Number,
    default: null
  },
  minWidth: {
    type: Number,
    default: null
  },
  minHeight: {
    type: Number,
    default: null
  },
  allowedTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  uploadTitle: {
    type: String,
    default: 'Upload Image'
  },
  uploadSubtitle: {
    type: String,
    default: 'Drag and drop your image here or click to browse'
  },
  buttonText: {
    type: String,
    default: 'Choose File'
  },
  replaceButtonText: {
    type: String,
    default: 'Replace'
  },
  removeButtonText: {
    type: String,
    default: 'Remove'
  },
  viewButtonText: {
    type: String,
    default: 'View'
  },
  imageAlt: {
    type: String,
    default: 'Uploaded image'
  },
  showReplaceButton: {
    type: Boolean,
    default: true
  },
  showRemoveButton: {
    type: Boolean,
    default: true
  },
  showViewButton: {
    type: Boolean,
    default: false
  },
  showImageInfo: {
    type: Boolean,
    default: true
  },
  helpText: {
    type: String,
    default: ''
  },
  autoPreview: {
    type: Boolean,
    default: true
  },
  validateOnChange: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'update:modelValue', 
  'file-selected', 
  'file-removed', 
  'validation-change',
  'image-load',
  'image-error',
  'drag-over',
  'drag-leave'
])

// Reactive state
const isDragOver = ref(false)
const previewUrl = ref('')
const selectedFile = ref(null)
const uploadProgress = ref(0)
const imageDimensions = ref(null)
const errorMessage = ref('')
const hasError = ref(false)

// Computed properties
const hasImage = computed(() => {
  return selectedFile.value !== null || (props.modelValue && (props.modelValue instanceof File || props.modelValue instanceof FileList))
})

// Methods
const triggerFileSelect = () => {
  if (!props.disabled) {
    fileInputRef.value?.click()
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files && files.length > 0) {
    const file = props.multiple ? files : files[0]
    processFiles(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    const file = props.multiple ? files : files[0]
    processFiles(file)
  }
  
  emit('drag-leave')
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
  emit('drag-over')
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
  emit('drag-leave')
}

const processFiles = (files) => {
  const fileArray = Array.from(files)
  
  // Validate files
  const validationResult = validateFiles(fileArray)
  if (!validationResult.isValid) {
    setError(validationResult.error)
    return
  }
  
  clearError()
  
  const file = fileArray[0] // For single file upload
  selectedFile.value = file
  
  // Create preview
  if (props.autoPreview) {
    createPreview(file)
  }
  
  // Emit events
  emit('update:modelValue', props.multiple ? files : file)
  emit('file-selected', props.multiple ? files : file)
  
  if (props.validateOnChange) {
    emit('validation-change', { isValid: true, errors: [] })
  }
}

const validateFiles = (files) => {
  for (const file of files) {
    // Check file type
    if (!props.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${props.allowedTypes.join(', ')}`
      }
    }
    
    // Check file size
    if (file.size > props.maxSize) {
      return {
        isValid: false,
        error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(props.maxSize)}`
      }
    }
  }
  
  return { isValid: true }
}

const createPreview = (file) => {
  if (!file) return
  
  // Clean up previous preview
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  previewUrl.value = URL.createObjectURL(file)
}

const handleImageLoad = (event) => {
  const img = event.target
  imageDimensions.value = {
    width: img.naturalWidth,
    height: img.naturalHeight
  }
  
  // Validate dimensions if specified
  if (props.maxWidth && img.naturalWidth > props.maxWidth) {
    setError(`Image width (${img.naturalWidth}px) exceeds maximum allowed width (${props.maxWidth}px)`)
    return
  }
  
  if (props.maxHeight && img.naturalHeight > props.maxHeight) {
    setError(`Image height (${img.naturalHeight}px) exceeds maximum allowed height (${props.maxHeight}px)`)
    return
  }
  
  if (props.minWidth && img.naturalWidth < props.minWidth) {
    setError(`Image width (${img.naturalWidth}px) is below minimum required width (${props.minWidth}px)`)
    return
  }
  
  if (props.minHeight && img.naturalHeight < props.minHeight) {
    setError(`Image height (${img.naturalHeight}px) is below minimum required height (${props.minHeight}px)`)
    return
  }
  
  emit('image-load', {
    file: selectedFile.value,
    dimensions: imageDimensions.value
  })
}

const handleImageError = () => {
  setError('Failed to load image preview')
  emit('image-error', selectedFile.value)
}

const removeImage = () => {
  // Clean up preview URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  
  // Reset state
  selectedFile.value = null
  imageDimensions.value = null
  uploadProgress.value = 0
  
  // Clear file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  
  // Emit events
  emit('update:modelValue', null)
  emit('file-removed')
  emit('validation-change', { isValid: true, errors: [] })
  
  clearError()
}

const viewImage = () => {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank')
  }
}

const setError = (message) => {
  errorMessage.value = message
  hasError.value = true
  emit('validation-change', { isValid: false, errors: [message] })
}

const clearError = () => {
  errorMessage.value = ''
  hasError.value = false
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const file = props.multiple ? newValue[0] : newValue
    selectedFile.value = file
    if (props.autoPreview) {
      createPreview(file)
    }
  } else {
    selectedFile.value = null
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = ''
    }
  }
}, { immediate: true })

// Cleanup on component unmount
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

// Expose methods for parent components
defineExpose({
  triggerFileSelect,
  removeImage,
  validateFiles,
  setError,
  clearError,
  fileInput: fileInputRef
})
</script>

<style scoped>
.image-uploader-wrapper {
  position: relative;
  width: 100%;
}

.image-uploader-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.image-uploader-container {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  transition: all 0.2s ease-in-out;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.image-uploader-container:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.image-uploader-container.is-dragover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: scale(1.02);
}

.image-uploader-container.has-image {
  border-style: solid;
  border-color: #10b981;
  background-color: #f0fdf4;
  padding: 1rem;
  min-height: auto;
}

.image-uploader-container.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.image-uploader-container.is-compact {
  min-height: 120px;
  padding: 1rem;
}

.image-uploader-container.has-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.upload-area {
  text-align: center;
  width: 100%;
}

.upload-icon {
  font-size: 3rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.upload-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.upload-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.upload-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.upload-button:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.upload-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.image-preview-area {
  width: 100%;
}

.image-preview-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.image-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.replace-button {
  background-color: #3b82f6;
  color: white;
}

.replace-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.remove-button {
  background-color: #ef4444;
  color: white;
}

.remove-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.view-button {
  background-color: #10b981;
  color: white;
}

.view-button:hover:not(:disabled) {
  background-color: #059669;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-info {
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  padding: 1rem;
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #374151;
}

.info-value {
  color: #6b7280;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease-in-out;
}

.progress-text {
  min-width: 3rem;
  text-align: right;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Compact mode adjustments */
.image-uploader-container.is-compact .upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.image-uploader-container.is-compact .upload-title {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.image-uploader-container.is-compact .upload-subtitle {
  font-size: 0.75rem;
  margin-bottom: 1rem;
}

.image-uploader-container.is-compact .upload-button {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.image-uploader-container.is-compact .image-preview {
  max-height: 150px;
}

.image-uploader-container.is-compact .image-actions {
  margin-bottom: 0.5rem;
}

.image-uploader-container.is-compact .action-button {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.image-uploader-container.is-compact .image-info {
  padding: 0.5rem;
  font-size: 0.75rem;
}
</style>
