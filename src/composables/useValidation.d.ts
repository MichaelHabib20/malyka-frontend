// src/composables/useValidation.d.ts

import { Ref } from 'vue';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export type ValidationRule =
  | string
  | {
      type: string;
      params?: any[] | any;
      message?: string;
    };

export function useValidation(): {
  validate: (value: any, rules?: ValidationRule[]) => boolean;
  errors: Ref<string[]>;
  validationRules: Record<string, any>;
};