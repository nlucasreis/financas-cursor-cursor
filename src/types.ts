export type PaymentMethod = 
  | 'pix' 
  | 'credit_card' 
  | 'debit' 
  | 'boleto' 
  | 'cash' 
  | 'auto_debit';

export type ExpenseStatus = 'pending' | 'paid';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  type: 'essential' | 'lifestyle' | 'savings' | 'utility' | 'other';
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // In BRL
  dueDate: string; // YYYY-MM-DD
  categoryId: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  monthYear: string; // YYYY-MM e.g. "2026-08"
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  monthlyBudget?: number;
}

export interface MonthSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  paidCount: number;
  totalCount: number;
  percentPaid: number;
  essentialTotal: number;
  lifestyleTotal: number;
  otherTotal: number;
}

