export interface RegisterKid {
  id: number;
  kid: {
    id: number;
    code: string;
    name: string;
    grade: {
      id: number;
      name: string;
    };
    class: {
      id: number;
      name: string;
    };
    area: string;
    whatsapp: string;
    birthDate: string;
    photo?: string;
  };
  registrationDate: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'partial';
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
} 