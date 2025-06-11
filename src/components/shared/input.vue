<template>
  <div class="input-wrapper" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    
    <div class="input-container">
      <i 
        v-if="leadingIcon" 
        :class="['input-icon leading-icon', leadingIcon]"
      ></i>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="type === 'number' ? min : undefined"
        :max="type === 'number' ? max : undefined"
        :class="[
          'input-field',
          { 'is-disabled': disabled },
          { 'has-suggestions': showSuggestions },
          { 'is-compact': compact },
          { 'has-leading-icon': leadingIcon },
          { 'has-trailing-icon': trailingIcon }
        ]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      <i 
        v-if="trailingIcon" 
        :class="[
          'input-icon trailing-icon', 
          trailingIcon,
          { 'clickable': isTrailingIconClickable }
        ]"
        @click="handleTrailingIconClick"
      ></i>
      
      <div v-if="showSuggestions && suggestions.length" class="suggestions-list">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="suggestion-item"
          :class="{ 'is-selected': selectedSuggestionIndex === index }"
          @click="selectSuggestion(suggestion)"
          @mouseover="selectedSuggestionIndex = index"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>

    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useValidation } from '../../composables/useValidation'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'number', 'email', 'password'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    required: true
  },
  validationRules: {
    type: Array,
    default: () => []
  },
  min: {
    type: Number,
    default: undefined
  },
  max: {
    type: Number,
    default: undefined
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  compact: {
    type: Boolean,
    default: false
  },
  leadingIcon: {
    type: String,
    default: null
  },
  trailingIcon: {
    type: String,
    default: null
  },
  isTrailingIconClickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'validation-change', 'suggestion-selected', 'trailing-icon-click'])

const { validate, errors } = useValidation()
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)
const isFocused = ref(false)

const hasError = computed(() => errors.value.length > 0)
const errorMessage = computed(() => errors.value[0] || '')

const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', props.type === 'number' ? Number(value) : value)
  validateInput(value)
  showSuggestions.value = props.suggestions.length > 0 && value.length > 0
}

const handleFocus = () => {
  isFocused.value = true
  if (props.suggestions.length > 0) {
    showSuggestions.value = true
  }
}

const handleBlur = () => {
  isFocused.value = false
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const handleKeydown = (event) => {
  if (!showSuggestions.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.min(
        selectedSuggestionIndex.value + 1,
        props.suggestions.length - 1
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        selectSuggestion(props.suggestions[selectedSuggestionIndex.value])
      }
      break
    case 'Escape':
      showSuggestions.value = false
      break
  }
}

const selectSuggestion = (suggestion) => {
  emit('update:modelValue', suggestion)
  emit('suggestion-selected', suggestion)
  showSuggestions.value = false
  validateInput(suggestion)
}

const validateInput = (value) => {
  const validationResult = validate(value, props.validationRules)
  emit('validation-change', {
    isValid: !hasError.value,
    errors: errors.value
  })
}

const handleTrailingIconClick = (event) => {
  if (props.isTrailingIconClickable) {
    emit('trailing-icon-click', event)
  }
}

watch(() => props.modelValue, (newValue) => {
  validateInput(newValue)
})
</script>

<style scoped>
.input-wrapper {
  position: relative;
  /* margin-bottom: 1rem; */
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
  pointer-events: none;
}

.leading-icon {
  left: 0.75rem;
}

.trailing-icon {
  right: 0.75rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field.is-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-field.has-error {
  border-color: #ef4444;
}

.input-field.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-field.is-compact {
  padding: 0.5rem 0.75rem;
  height: 36px;
  font-size: 0.875rem;
}

.input-field.has-leading-icon {
  padding-left: 2.5rem;
}

.input-field.has-trailing-icon {
  padding-right: 2.5rem;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}

.suggestions-list {
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

.suggestion-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.suggestion-item:hover,
.suggestion-item.is-selected {
  background-color: #f3f4f6;
}

/* Custom scrollbar for suggestions */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.input-icon.clickable {
  cursor: pointer;
  pointer-events: auto;
}

.input-icon.clickable:hover {
  color: #3b82f6;
}
</style>
