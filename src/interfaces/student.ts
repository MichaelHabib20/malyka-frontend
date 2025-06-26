import type { Class } from "./class";
import type { Grade } from "./grade";
export interface Student {
  id: number;
  code: string;
  class: Class;
  name: string;
  number: string;
  subStreet: string;
  mainStreet: string;
  area: string;
  floor: string;
  apartment: string;
  notes: string;
  homePhone: string;
  motherMobile: string;
  fatherMobile: string;
  birthDate: string;
  age: number;
  siblings: boolean;
  gender: string;
  nationalId: string;
  grade: Grade;
  photo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUp {
  id: number;
  studentId: number;
  date: string;
  type: 'call' | 'home_visit';
  status: 'good' | 'needs_care' | 'bad_mood';
  notes: string;
  nextFollowUp?: string;
  createdAt: string;
}

export interface FollowUpForm {
  type: 'call' | 'home_visit';
  status: 'good' | 'needs_care' | 'bad_mood';
  notes: string;
  nextFollowUp?: string;
} 