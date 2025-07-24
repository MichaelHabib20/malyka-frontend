<template>
  <div class="date-picker-wrapper" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id" class="date-picker-label">{{ label }}</label>
    
    <div class="date-picker-container">
      <div class="date-picker-input-wrapper">
        <input
          :id="id"
          type="text"
          :value="displayValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :class="[
            'date-picker-input',
            { 'is-disabled': disabled },
            { 'is-compact': compact }
          ]"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          readonly
        />
        <button 
          class="calendar-button"
          :disabled="disabled"
          @click.stop="toggleCalendar"
          type="button"
        >
        <i class="fa-regular fa-calendar"></i>
        </button>
      </div>

      <div v-if="showCalendar" class="calendar-popup">
        <div class="calendar-header">
          <button 
            class="calendar-nav-button"
            @click="previousMonth"
            type="button"
          >
            ‹
          </button>
          <div class="current-month">
            {{ currentMonthYear }}
          </div>
          <button 
            class="calendar-nav-button"
            @click="nextMonth"
            type="button"
          >
            ›
          </button>
        </div>

        <div class="calendar-weekdays">
          <div v-for="day in weekDays" :key="day" class="weekday">
            {{ day }}
          </div>
        </div>

        <div class="calendar-days">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'calendar-day',
              {
                'is-today': isToday(day),
                'is-selected': isSelected(day),
                'is-disabled': isDisabled(day),
                'is-other-month': !isCurrentMonth(day)
              }
            ]"
            @click="selectDate(day)"
          >
            {{ day.getDate() }}
          </div>
        </div>

        <div class="calendar-footer">
          <button 
            class="today-button"
            @click="selectToday"
            type="button"
          >
            Today
          </button>
          <button 
            class="clear-button"
            @click="clearDate"
            type="button"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div v-if="hasError" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useValidation, type ValidationRule } from '../../composables/useValidation'
import statusService from '../../services/statusService'
import { dataService } from '../../services/dataContext'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  isNeedNetwork: {
    type: Boolean,
    default: false
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
  dateFormat: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  minDate: {
    type: Date,
    default: null
  },
  maxDate: {
    type: Date,
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'validation-change'])

const { validate, errors } = useValidation()
const showCalendar = ref(false)
const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(props.modelValue)
const hasError = computed(() => errors.value.length > 0)
const errorMessage = computed(() => errors.value[0] || '')
const isOnline = ref(statusService.isOnline());

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return formatDate(selectedDate.value)
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days: Date[] = []
  
  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  // Add days from next month
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }
  
  return days
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

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  console.log(value)
  // Only allow manual input if you want to support it
  // Otherwise, this can be removed since the input is readonly
}

const handleFocus = () => {
  if (!props.disabled) {
    showCalendar.value = true
  }
}

const handleBlur = () => {
  setTimeout(() => {
    showCalendar.value = false
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    showCalendar.value = false
  }
}

const toggleCalendar = () => {
  if (!props.disabled) {
    showCalendar.value = !showCalendar.value
  }
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const isSelected = (date: Date): boolean => {
  if (!selectedDate.value) return false
  return date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
}

const isDisabled = (date: Date): boolean => {
  if (props.minDate && date < props.minDate) return true
  if (props.maxDate && date > props.maxDate) return true
  return false
}

const isCurrentMonth = (date: Date): boolean => {
  return date.getMonth() === currentDate.value.getMonth()
}

const selectDate = (date: Date) => {
  if (isDisabled(date)) return
  if(!isOnline.value && props.isNeedNetwork){
        dataService.createAlertMessage('You are offline, this action can not be performed', 'warning')
        showCalendar.value = false
        return;
    }
  selectedDate.value = date
  emit('update:modelValue', date)
  validateInput(date)
  showCalendar.value = false
}

const selectToday = () => {
  const today = new Date()
  if (!isDisabled(today)) {
    selectDate(today)
  }
}

const clearDate = () => {
  selectedDate.value = null
  emit('update:modelValue', null)
  validateInput(null)
  showCalendar.value = false
}

const validateInput = (value: Date | null) => {
  const validationResult = validate(value, props.validationRules as ValidationRule[])
  console.log(validationResult)
  emit('validation-change', {
    isValid: !hasError.value,
    errors: errors.value
  })
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.date-picker-container')) {
    showCalendar.value = false
  }
}

onMounted(() => {
    statusService.subscribe((status) => {
    isOnline.value = status;
  });
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => props.modelValue, (newValue) => {
  selectedDate.value = newValue
  validateInput(newValue)
})
</script>

<style scoped>
.date-picker-wrapper {
  position: relative;
  width: 100%;
}

.date-picker-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.date-picker-container {
  position: relative;
}

.date-picker-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-picker-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.date-picker-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-picker-input.is-disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.7;
}

.date-picker-input.has-error {
  border-color: #ef4444;
}

.date-picker-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.date-picker-input.is-compact {
  padding: 0.5rem 0.75rem;
  height: 36px;
  font-size: 0.875rem;
}

.calendar-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s ease-in-out;
}

.calendar-button:hover:not(:disabled) {
  color: #3b82f6;
}

.calendar-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.calendar-icon {
  font-size: 1.25rem;
}

.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  margin-top: 0.25rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 280px;
  padding: 0.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.calendar-nav-button {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.25rem;
  transition: color 0.2s ease-in-out;
}

.calendar-nav-button:hover {
  color: #3b82f6;
}

.current-month {
  font-weight: 500;
  color: #374151;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  padding: 0.25rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
}

.calendar-day:hover:not(.is-disabled) {
  background-color: #f3f4f6;
}

.calendar-day.is-today {
  font-weight: 500;
  color: #3b82f6;
}

.calendar-day.is-selected {
  background-color: #3b82f6;
  color: white;
}

.calendar-day.is-disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.calendar-day.is-other-month {
  color: #9ca3af;
}

.calendar-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.today-button,
.clear-button {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background-color: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.today-button:hover,
.clear-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.error-message {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #ef4444;
}
</style>
