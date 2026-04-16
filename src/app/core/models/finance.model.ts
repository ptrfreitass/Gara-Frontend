// src/app/core/models/finance.model.ts

export enum TransactionType {
  INCOME   = 'income',
  EXPENSE  = 'expense',
  TRANSFER = 'transfer',
}

export enum PaymentMethod {
  CASH     = 'cash',
  PIX      = 'pix',
  DEBIT    = 'debit',
  CREDIT   = 'credit',
  TED      = 'ted',
  BOLETO   = 'boleto',
  TRANSFER = 'transfer',
  OTHER    = 'other',
}

export enum TransactionStatus {
  PENDING   = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ImportSessionStatus {
  PENDING   = 'pending',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ImportItemStatus {
  PENDING   = 'pending',
  CONFIRMED = 'confirmed',
  SKIPPED   = 'skipped',
}

export enum AccountType {
  CASH           = 'cash',
  CHECKING       = 'checking',
  SAVINGS        = 'savings',
  INVESTMENT     = 'investment',
  DIGITAL_WALLET = 'digital_wallet',
  OTHER          = 'other',
}

// -------------------------
// Entidades base
// -------------------------

export interface Bank {
  id: number;
  name: string;
  code: string | null;
  logo_url: string | null;
}

export interface FinanceAccount {
  id: number;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  bank: Bank | null;
  created_at: string;
}

export interface CreditCard {
  id: number;
  name: string;
  last_four_digits: string | null;
  credit_limit: number;
  available_credit: number;
  used_credit: number;
  closing_day: number;
  due_day: number;
  color: string | null;
  is_active: boolean;
  bank: Bank | null;
  current_invoice: CreditCardInvoice | null;
  created_at: string;
}

export interface CreditCardInvoice {
  id: number;
  reference_month: number;
  reference_year: number;
  total_amount: number;
  due_date: string;
  status: 'open' | 'closed' | 'paid' | 'overdue';
}

export interface Category {
  id: number;
  name: string;
  type: TransactionType | 'both';
  color: string | null;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  color: string | null;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  date: string;
  type: TransactionType;
  payment_method: PaymentMethod | null;
  status: TransactionStatus;
  category_id: number;
  subcategory_id?: number;
  finance_account_id?: number;
  credit_card_id?: number;
  transfer_to_account_id?: number;
  external_id?: string | null;
  import_item_id?: number | null;
  category: Category;
  subcategory?: Subcategory;
  finance_account?: { id: number; name: string; type: string } | null;
  transfer_to_account?: { id: number; name: string } | null;
  credit_card?: { id: number; name: string } | null;
  created_at: string;
}

export interface Balance {
  total_income: number;
  total_expense: number;
  balance: number;
  updated_at: string;
}

export interface TransactionFilters {
  type?: string;
  category_id?: string | number;
  payment_method?: string;
  finance_account_id?: string | number;
  credit_card_id?: string | number;
  start_date?: string;
  end_date?: string;
}

// -------------------------
// Import
// -------------------------

export interface ImportAccountRef {
  id: number;
  name: string;
}

export interface ImportCategoryRef {
  id: number;
  name: string;
  color: string | null;
}

export interface ImportSubcategoryRef {
  id: number;
  name: string;
}

export interface ImportRuleRef {
  id: number;
  keyword: string;
}

export interface ImportRule {
  id: number;
  keyword: string;
  type: TransactionType | null;
  payment_method: PaymentMethod | null;
  match_count: number;
  last_matched_at: string | null;
  category: ImportCategoryRef | null;
  subcategory: ImportSubcategoryRef | null;
  finance_account: ImportAccountRef | null;
  transfer_to_account: ImportAccountRef | null;
  created_at: string;
}

export interface ImportItem {
  id: number;
  original_description: string;
  original_amount: number;
  absolute_amount: number;
  original_date: string;
  external_id: string | null;
  detected_type: TransactionType | null;

  // Editáveis
  type: TransactionType | null;
  description: string | null;
  payment_method: PaymentMethod | null;
  status: ImportItemStatus;

  // Relações
  category: ImportCategoryRef | null;
  subcategory: ImportSubcategoryRef | null;
  finance_account: ImportAccountRef | null;
  transfer_to_account: ImportAccountRef | null;
  matched_rule: ImportRuleRef | null;

  transaction_id: number | null;

  // Campos locais (UI only — não vêm do backend)
  remember?: boolean;
  keyword?: string;
  isDirty?: boolean;
}

export interface ImportSession {
  id: number;
  bank: { id: number; name: string; code: string };
  filename: string;
  status: ImportSessionStatus;
  total_rows: number;
  confirmed_rows: number;
  skipped_rows: number;
  pending_count: number;
  items: ImportItem[];
  created_at: string;
}

// -------------------------
// Paginação
// -------------------------

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}