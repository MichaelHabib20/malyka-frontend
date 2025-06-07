import { ref } from 'vue'

interface User {
  id?: string
  email?: string
  name?: string
}

// Create a reactive user ref that can be used across components
export const user = ref<User | null>(null)

// Helper function to update user data
export const setUser = (userData: User | null) => {
  user.value = userData
}

// Helper function to get user data
export const getUser = () => user.value
