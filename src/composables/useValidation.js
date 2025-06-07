import { ref } from 'vue'

const errors = ref([])

const validationRules = {
  required: (value) => ({
    isValid: value !== undefined && value !== null && value !== '',
    message: 'This field is required'
  }),
  
  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),
  
  minLength: (min) => (value) => ({
    isValid: value.length >= min,
    message: `Minimum length is ${min} characters`
  }),
  
  maxLength: (max) => (value) => ({
    isValid: value.length <= max,
    message: `Maximum length is ${max} characters`
  }),
  
  min: (min) => (value) => ({
    isValid: Number(value) >= min,
    message: `Minimum value is ${min}`
  }),
  
  max: (max) => (value) => ({
    isValid: Number(value) <= max,
    message: `Maximum value is ${max}`
  }),
  
  pattern: (regex, message) => (value) => ({
    isValid: regex.test(value),
    message: message || 'Invalid format'
  }),
  
  custom: (validator, message) => (value) => ({
    isValid: validator(value),
    message: message || 'Invalid value'
  })
}

const validate = (value, rules = []) => {
  errors.value = []
  
  if (!rules.length) return true
  
  for (const rule of rules) {
    let validationResult
    
    if (typeof rule === 'string' && validationRules[rule]) {
      validationResult = validationRules[rule](value)
    } else if (typeof rule === 'object') {
      const { type, params, message } = rule
      if (validationRules[type]) {
        const validator = validationRules[type](...(Array.isArray(params) ? params : [params]))
        validationResult = validator(value)
        if (message) validationResult.message = message
      }
    }
    
    if (validationResult && !validationResult.isValid) {
      errors.value.push(validationResult.message)
    }
  }
  
  return errors.value.length === 0
}

export const useValidation = () => {
  return {
    validate,
    errors,
    validationRules
  }
} 