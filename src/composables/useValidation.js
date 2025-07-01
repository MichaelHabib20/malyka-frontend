import { ref } from 'vue'

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
  
  fourWords: (value) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    const isValid = words.length === 4 && words.every(word => word.length >= 2)
    return {
      isValid,
      message: 'Please enter exactly 4 words, each with at least 2 characters'
    }
  },
  
  noConsecutiveSpaces: (enabled = true) => (value) => {
    if (!enabled) {
      return { isValid: true, message: '' }
    }
    
    const hasConsecutiveSpaces = /\s{3,}/.test(value)
    return {
      isValid: !hasConsecutiveSpaces,
      message: 'Please do not enter more than 2 consecutive spaces'
    }
  },
  
  custom: (validator, message) => (value) => ({
    isValid: validator(value),
    message: message || 'Invalid value'
  })
}

export const useValidation = () => {
  const errors = ref([])
  
  const validate = (value, rules = []) => {
    errors.value = []
    
    if (!rules.length) return true
    
    
    for (const rule of rules) {
      let validationResult
      
      if (typeof rule === 'string' && validationRules[rule]) {
        const validator = validationRules[rule]
        if (typeof validator === 'function') {
          const result = validator(value)
          if (typeof result === 'function') {
            validationResult = result(value)
          } else {
            validationResult = result
          }
        } else {
          validationResult = validator(value)
        }
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

  return {
    validate,
    errors,
    validationRules
  }
} 