export interface Permission {
    id: number;
    name: string;
}
export interface Role {
    id?: number
    name: string
    permissions?: number[]
  }
  
  export interface FormData {
    name: string
    permissions: number[]
  }
  
  export interface ValidationResult {
    isValid: boolean
    errors: string[]
  }