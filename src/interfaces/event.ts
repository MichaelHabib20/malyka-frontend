export interface Event {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  maxTeamSize: number;
  price: number;
  numberOfInstallments: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: number;
  eventId: number;
  name: string;
  color: string;
  maxCapacity: number;
  currentMembers: number;
  members: TeamMember[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  gender: 'male' | 'female';
  joinedAt: string;
}

export interface EventBooking {
  id: number;
  eventId: number;
  teamId: number;
  studentId: number;
  notes?: string;
  bookedAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  installmentType: number;
  totalAmount: number;
  installmentAmount: number;
  remainingInstallments: number;
  paidInstallments: number;
  totalPaidAmount: number;
}

export interface InstallmentPayment {
  id: number;
  bookingId: number;
  installmentNumber: number;
  amount: number;
  paidAt: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
  receiptNumber?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface PaymentHistory {
  bookingId: number;
  studentId: number;
  eventId: number;
  teamId: number;
  totalAmount: number;
  installmentType: number;
  installmentAmount: number;
  totalPaidAmount: number;
  remainingInstallments: number;
  paidInstallments: number;
  payments: InstallmentPayment[];
  nextPaymentDue?: string;
  isFullyPaid: boolean;
}

export interface TeamStats {
  totalMembers: number;
  maleCount: number;
  femaleCount: number;
  availableSlots: number;
} 