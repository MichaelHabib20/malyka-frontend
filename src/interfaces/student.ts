import type { Class } from "./class";
import type { Grade } from "./grade";
export interface Student {
  id: number;
  code: string;
  verificationCode?: string | undefined;
  class: Class;
  classId?: number;
  name: string;
  number: string;
  sideStreet: string;
  mainStreet: string;
  area: string;
  floor: string;
  apartmentNumber: string;
  fullAddress ? : string;
  landmark?: string | undefined;
  whatsapp: string;
  momMob: string;
  dadMob: string;
  birthDate: string;
  age: number;
  siblings: boolean;
  gender: string;
  nationalId: string;
  grade: Grade;
  gradeId?: number;
  isNew?: boolean;
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