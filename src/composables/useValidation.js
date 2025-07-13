import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const createValidationRules = (t) => ({
  required: (value) => ({
    isValid: value !== undefined && value !== null && value !== '',
    message: t('validation.required')
  }),
  
  email: (value) => ({
    isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: t('validation.email')
  }),
  
  minLength: (min) => (value) => ({
    isValid: value.length >= min,
    message: t('validation.minLength', { min })
  }),
  
  maxLength: (max) => (value) => ({
    isValid: value.length <= max,
    message: t('validation.maxLength', { max })
  }),
  
  min: (min) => (value) => ({
    isValid: Number(value) >= min,
    message: t('validation.min', { min })
  }),
  
  max: (max) => (value) => ({
    isValid: Number(value) <= max,
    message: t('validation.max', { max })
  }),
  
  pattern: (regex, message) => (value) => ({
    isValid: regex.test(value),
    message: message || t('validation.invalidFormat')
  }),
  
  fourWords: (value) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0)
    const isValid = words.length >= 4 && words.every(word => word.length >= 2)
    return {
      isValid,
      message: t('validation.fourWords')
    }
  },
  
  noConsecutiveSpaces: (enabled = true) => (value) => {
    if (!enabled) {
      return { isValid: true, message: '' }
    }
    
    const hasConsecutiveSpaces = /\s{3,}/.test(value)
    return {
      isValid: !hasConsecutiveSpaces,
      message: t('validation.noConsecutiveSpaces')
    }
  },
  
  custom: (validator, message) => (value) => ({
    isValid: validator(value),
    message: message || t('validation.invalidValue')
  }),
  
  // Custom validation for 14-digit ID starting with 3 and containing birthday, or 7-digit number
  idOrPhone: (value) => {
    if (!value) return { isValid: false, message: t('validation.required') }
    
    const strValue = String(value).replace(/\s/g, '') // Remove spaces
    
    // Pattern 1: 14 digits starting with 3, with birthday in positions 2-7 (YYMMDD format)
    const pattern1 = /^3\d{13}$/
    if (pattern1.test(strValue)) {
      const birthdayPart = strValue.substring(1, 7) // Get the 6 digits after the first 3
      const year = parseInt(birthdayPart.substring(0, 2))
      const month = parseInt(birthdayPart.substring(2, 4))
      const day = parseInt(birthdayPart.substring(4, 6))
      
      // Basic date validation
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return { isValid: true, message: '' }
      }
    }
    
    // Pattern 2: Exactly 7 digits
    const pattern2 = /^\d{7}$/
    if (pattern2.test(strValue)) {
      return { isValid: true, message: '' }
    }
    
    return { 
      isValid: false, 
      message: t('validation.idOrPhone')
    }
  },
  
  // Validation to prevent English letters
  noEnglishLetters: (value) => {
    if (!value) return { isValid: true, message: '' }
    
    const englishLettersRegex = /[a-zA-Z]/
    const hasEnglishLetters = englishLettersRegex.test(value)
    
    return {
      isValid: !hasEnglishLetters,
      message: t('validation.noEnglishLetters')
    }
  },
  
  // Age validation for students (3-8 years old)
  studentAge: (value) => {
    if (!value) return { isValid: false, message: t('validation.required') }
    
    const birthDate = new Date(value)
    const today = new Date()
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    const isValid = age >= 3 && age <= 8
    
    return {
      isValid,
      message: t('validation.studentAge', { min: 3, max: 8 })
    }
  }
})

export const useValidation = () => {
  const { t } = useI18n()
  const errors = ref([])
  const validationRules = createValidationRules(t)
  
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