<template>
  <div class="select-wrapper" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id" class="select-label">{{ label }}</label>
    
    <div class="select-container">
      <div
        class="select-field"
        :class="[
          { 'is-disabled': disabled },
          { 'is-open': isOpen },
          { 'has-value': modelValue !== '' },
          { 'is-compact': compact }
        ]"
        @click="!disabled && toggleDropdown()"
        @blur="handleBlur"
        tabindex="0"
      >
        <span class="select-value">
          {{ displayValue }}
        </span>
        <span class="select-arrow" :class="{ 'is-open': isOpen }">▼</span>
      </div>
      
      <div v-if="isOpen" class="options-list">
        <div
          v-for="option in formattedOptions"
          :key="typeof option.value === 'object' ? option.value.toString() : option.value"
          class="option-item"
          :class="{ 'is-selected': option.value === modelValue }"
          @mousedown="selectOption(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>

    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useValidation } from '../../composables/useValidation'

interface Option {
  label: string
  value: string | number | Date
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Date],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  options: {
    type: Array as () => Option[],
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: false
  },
  validationRules: {
    type: Array,
    default: () => []
  },
  isDate: {
    type: Boolean,
    default: false
  },
  dateFormat: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'validation-change'])

const { validate, errors } = useValidation()
const isOpen = ref(false)
const hasError = computed(() => errors.value.length > 0)
const errorMessage = computed(() => errors.value[0] || '')

const formattedOptions = computed(() => {
  return props.options.map(option => ({
    ...option,
    label: props.isDate && option.value instanceof Date
      ? formatDate(option.value as Date)
      : option.label
  }))
})

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  
  const selectedOption = props.options.find(opt => opt.value === props.modelValue)
  if (!selectedOption) return props.placeholder
  
  if (props.isDate && selectedOption.value instanceof Date) {
    return formatDate(selectedOption.value)
  }
  
  return selectedOption.label
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return props.dateFormat
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const handleBlur = () => {
  setTimeout(() => {
    isOpen.value = false
  }, 200)
}

const selectOption = (value: string | number | Date) => {
  emit('update:modelValue', value)
  isOpen.value = false
  validateInput(value)
}

const validateInput = (value: string | number | Date) => {
  const validationResult = validate(value, props.validationRules)
  emit('validation-change', {
    isValid: !hasError.value,
    errors: errors.value
  })
}

watch(() => props.modelValue, (newValue) => {
  validateInput(newValue)
})
</script>

<style scoped>
.select-wrapper {
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.select-container {
  position: relative;
}

.select-field {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.select-field.is-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.select-field.has-error {
  border-color: #ef4444;
}

.select-field.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select-field.is-compact {
  padding: 0.5rem 0.75rem;
  height: 36px;
  font-size: 0.875rem;
}

.select-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-arrow {
  font-size: 0.75rem;
  color: #6b7280;
  transition: transform 0.2s ease-in-out;
  margin-left: 0.5rem;
}

.select-arrow.is-open {
  transform: rotate(180deg);
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.options-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin-top: 0.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.option-item:hover {
  background-color: #f3f4f6;
}

.option-item.is-selected {
  background-color: #e5e7eb;
  font-weight: 500;
}

/* Custom scrollbar for options */
.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 