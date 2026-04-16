// src/app/core/services/finance/finance.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/enviroment';
import {
  Bank, FinanceAccount, CreditCard,
  Category, Subcategory, Transaction,
  Balance, PaginatedResponse, TransactionFilters,
  ImportSession, ImportItem, ImportRule,
} from '../../models/finance.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly api = `${environment.apiUrl}/finance`;
  private readonly importApi = `${environment.apiUrl}/finance/import`;

  constructor(private http: HttpClient) {}

  // -------------------------
  // Bancos
  // -------------------------
  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(`${this.api}/banks`);
  }

  // -------------------------
  // Contas financeiras
  // -------------------------
  getAccounts(): Observable<FinanceAccount[]> {
    return this.http.get<FinanceAccount[]>(`${this.api}/accounts`);
  }

  createAccount(data: Partial<FinanceAccount>): Observable<FinanceAccount> {
    return this.http.post<FinanceAccount>(`${this.api}/accounts`, data);
  }

  updateAccount(id: number, data: Partial<FinanceAccount>): Observable<FinanceAccount> {
    return this.http.put<FinanceAccount>(`${this.api}/accounts/${id}`, data);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/accounts/${id}`);
  }

  // -------------------------
  // Cartões de crédito
  // -------------------------
  getCreditCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(`${this.api}/credit-cards`);
  }

  createCreditCard(data: Partial<CreditCard>): Observable<CreditCard> {
    return this.http.post<CreditCard>(`${this.api}/credit-cards`, data);
  }

  updateCreditCard(id: number, data: Partial<CreditCard>): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${this.api}/credit-cards/${id}`, data);
  }

  deleteCreditCard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/credit-cards/${id}`);
  }

  // -------------------------
  // Categorias
  // -------------------------
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.api}/categories`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/categories/${id}`);
  }

  createSubcategory(data: Partial<Subcategory>): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.api}/subcategories`, data);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/subcategories/${id}`);
  }

  // -------------------------
  // Transações
  // -------------------------
  getTransactions(filters: TransactionFilters = {}): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();
    (Object.keys(filters) as (keyof TransactionFilters)[]).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.append(key, String(value));
      }
    });
    return this.http.get<PaginatedResponse<Transaction>>(`${this.api}/transactions`, { params });
  }

  createTransaction(data: Partial<Transaction>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.api}/transactions`, data);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/transactions/${id}`);
  }

  // -------------------------
  // Saldo
  // -------------------------
  getBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.api}/balance`);
  }

  // -------------------------
  // Import — Sessões
  // -------------------------
  uploadExtract(file: File, bankId: number): Observable<{ message: string; session: ImportSession }> {
    const form = new FormData();
    form.append('file', file);
    form.append('bank_id', String(bankId));
    return this.http.post<{ message: string; session: ImportSession }>(
      `${this.importApi}/upload`, form
    );
  }

  getImportSessions(): Observable<PaginatedResponse<ImportSession>> {
    return this.http.get<any>(`${this.importApi}/sessions`).pipe(
      map(res => ({ data: res.data, meta: res.meta }))
    );
  }

  getImportSession(id: number): Observable<ImportSession> {
    return this.http.get<{ session: ImportSession }>(`${this.importApi}/sessions/${id}`).pipe(
      map(res => res.session)
    );
  }

  confirmImportSession(id: number): Observable<{ message: string; session: ImportSession }> {
    return this.http.post<{ message: string; session: ImportSession }>(
      `${this.importApi}/sessions/${id}/confirm`, {}
    );
  }

  cancelImportSession(id: number): Observable<void> {
    return this.http.delete<void>(`${this.importApi}/sessions/${id}`);
  }

  // -------------------------
  // Import — Itens
  // -------------------------
  updateImportItem(id: number, data: Partial<ImportItem> & { remember?: boolean; keyword?: string }): Observable<{ message: string; item: ImportItem }> {
    return this.http.patch<{ message: string; item: ImportItem }>(
      `${this.importApi}/items/${id}`, data
    );
  }

  // -------------------------
  // Import — Regras
  // -------------------------
  getImportRules(): Observable<ImportRule[]> {
    return this.http.get<{ data: ImportRule[] }>(`${this.importApi}/rules`).pipe(
      map(res => res.data)
    );
  }

  updateImportRule(id: number, data: Partial<ImportRule>): Observable<{ message: string; rule: ImportRule }> {
    return this.http.patch<{ message: string; rule: ImportRule }>(
      `${this.importApi}/rules/${id}`, data
    );
  }

  deleteImportRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.importApi}/rules/${id}`);
  }
}