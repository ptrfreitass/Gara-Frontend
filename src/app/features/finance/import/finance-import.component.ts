// src/app/features/finance/import/finance-import.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FinanceService } from '../../../core/services/finance/finance';
import { Bank, ImportSession, ImportSessionStatus, PaginatedResponse } from '../../../core/models/finance.model';

@Component({
  selector: 'app-finance-import',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="import-page">

      <!-- Upload -->
      <section class="upload-card">
        <h3>Importar Extrato</h3>
        <p class="subtitle">Selecione o banco e envie o arquivo CSV do extrato.</p>

        <div class="form-row">
          <select [value]="selectedBankId()" (change)="onBankChange($event)" [disabled]="uploading()">
            <option value="">Selecione o banco</option>
            @for (bank of banks(); track bank.id) {
              <option [value]="bank.id">{{ bank.name }}</option>
            }
          </select>

          <label class="file-label" [class.disabled]="!selectedBankId() || uploading()">
            <input
              type="file"
              accept=".csv,.ofx,.txt"
              (change)="onFileSelected($event)"
              [disabled]="!selectedBankId() || uploading()"
            />
            {{ selectedFile() ? selectedFile()!.name : 'Escolher arquivo' }}
          </label>

          <button
            class="btn-primary"
            (click)="upload()"
            [disabled]="!selectedFile() || !selectedBankId() || uploading()"
          >
            {{ uploading() ? 'Enviando...' : 'Enviar' }}
          </button>
        </div>

        @if (uploadError()) {
          <p class="error">{{ uploadError() }}</p>
        }
      </section>

      <!-- Histórico -->
      <section class="sessions-card">
        <h3>Histórico de Importações</h3>

        @if (loading()) {
          <p class="loading">Carregando...</p>
        } @else if (sessions().length === 0) {
          <p class="empty">Nenhuma importação encontrada.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Banco</th>
                <th>Arquivo</th>
                <th>Status</th>
                <th>Linhas</th>
                <th>Data</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (session of sessions(); track session.id) {
                <tr>
                  <td>{{ session.bank.name }}</td>
                  <td class="filename">{{ session.filename }}</td>
                  <td>
                    <span class="badge" [class]="'badge--' + session.status">
                      {{ statusLabel(session.status) }}
                    </span>
                  </td>
                  <td>{{ session.confirmed_rows }}/{{ session.total_rows }}</td>
                  <td>{{ session.created_at | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>
                    @if (session.status === SessionStatus.PENDING || session.status === SessionStatus.REVIEWING) {
                      <button class="btn-link" (click)="review(session.id)">Revisar</button>
                    } @else {
                      <button class="btn-link" (click)="review(session.id)">Ver</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

    </div>
  `,
  styles: [`
    .import-page { display: flex; flex-direction: column; gap: 1.5rem; padding: 1.5rem; }

    .upload-card, .sessions-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }

    h3 { margin: 0 0 0.25rem; font-size: 1.1rem; font-weight: 600; }
    .subtitle { margin: 0 0 1rem; color: var(--text-muted); font-size: 0.875rem; }

    .form-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font-size: 0.875rem;
      min-width: 180px;
    }

    .file-label {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 0.75rem;
      border: 1px dashed var(--border);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--text-muted);
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: border-color 0.2s;

      &:hover:not(.disabled) { border-color: var(--primary); color: var(--primary); }
      &.disabled { opacity: 0.5; cursor: not-allowed; }

      input[type="file"] { display: none; }
    }

    .btn-primary {
      padding: 0.5rem 1.25rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-link {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      &:hover { background: var(--primary-soft); }
    }

    .error { color: var(--danger); font-size: 0.875rem; margin-top: 0.5rem; }
    .loading, .empty { color: var(--text-muted); font-size: 0.875rem; }

    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin-top: 1rem; }
    th { text-align: left; padding: 0.5rem 0.75rem; color: var(--text-muted); font-weight: 500; border-bottom: 1px solid var(--border); }
    td { padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--border-soft); }
    .filename { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      &--pending   { background: var(--warning-soft); color: var(--warning); }
      &--reviewing { background: var(--info-soft);    color: var(--info); }
      &--completed { background: var(--success-soft); color: var(--success); }
      &--cancelled { background: var(--danger-soft);  color: var(--danger); }
    }
  `]
})
export class FinanceImportComponent implements OnInit {

  readonly SessionStatus = ImportSessionStatus;

  banks       = signal<Bank[]>([]);
  sessions    = signal<ImportSession[]>([]);
  loading     = signal(true);
  uploading   = signal(false);
  uploadError = signal<string | null>(null);

  selectedBankId = signal<number | null>(null);
  selectedFile   = signal<File | null>(null);

  constructor(
    private financeService: FinanceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadBanks();
    this.loadSessions();
  }

  private loadBanks(): void {
    this.financeService.getBanks().subscribe({
      next: banks => this.banks.set(banks),
    });
  }

  private loadSessions(): void {
    this.loading.set(true);
    this.financeService.getImportSessions().subscribe({
      next: res => { this.sessions.set(res.data); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  onBankChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBankId.set(value ? Number(value) : null);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile.set(file);
    this.uploadError.set(null);
  }

  upload(): void {
    const file   = this.selectedFile();
    const bankId = this.selectedBankId();
    if (!file || !bankId) return;

    this.uploading.set(true);
    this.uploadError.set(null);

    this.financeService.uploadExtract(file, bankId).subscribe({
      next: res => {
        this.uploading.set(false);
        this.selectedFile.set(null);
        this.router.navigate(['/app/finance/import', res.session.id]);
      },
      error: err => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Erro ao enviar arquivo.');
      },
    });
  }

  review(id: number): void {
    this.router.navigate(['/app/finance/import', id]);
  }

  statusLabel(status: ImportSessionStatus): string {
    const map: Record<ImportSessionStatus, string> = {
      [ImportSessionStatus.PENDING]:   'Pendente',
      [ImportSessionStatus.REVIEWING]: 'Revisando',
      [ImportSessionStatus.COMPLETED]: 'Concluído',
      [ImportSessionStatus.CANCELLED]: 'Cancelado',
    };
    return map[status] ?? status;
  }
}