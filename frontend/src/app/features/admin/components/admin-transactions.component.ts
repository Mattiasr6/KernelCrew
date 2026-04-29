import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubscriptionService } from '../../core/services/subscription.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="transactions-container animate-fade-in">
      <div class="header-section mb-8">
        <h1 class="text-3xl font-bold text-white">Transacciones de Pago</h1>
        <p class="text-slate-400 mt-1">Administra los pagos e ingresos del sistema</p>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="stat-card glass-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">Ingresos Totales</p>
              <p class="text-white text-2xl font-bold">\${{ stats().total_revenue | number: '1.2-2' }}</p>
            </div>
            <span class="material-symbols-outlined text-emerald-500 text-4xl">trending_up</span>
          </div>
        </div>
        <div class="stat-card glass-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">Transacciones</p>
              <p class="text-white text-2xl font-bold">{{ stats().total_transactions }}</p>
            </div>
            <span class="material-symbols-outlined text-blue-500 text-4xl">receipt</span>
          </div>
        </div>
        <div class="stat-card glass-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-slate-400 text-sm mb-1">Pendientes</p>
              <p class="text-white text-2xl font-bold">{{ stats().pending_payments }}</p>
            </div>
            <span class="material-symbols-outlined text-orange-500 text-4xl">schedule</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters glass-card p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="search" placeholder="Usuario o email" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="statusFilter">
              <mat-option value="">Todos</mat-option>
              <mat-option value="completed">Completado</mat-option>
              <mat-option value="pending">Pendiente</mat-option>
              <mat-option value="failed">Fallido</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Método</mat-label>
            <mat-select [(ngModel)]="methodFilter">
              <mat-option value="">Todos</mat-option>
              <mat-option value="stripe">Stripe</mat-option>
              <mat-option value="simulated">Simulado</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button class="search-btn" (click)="loadTransactions()">
            Buscar
          </button>
        </div>
      </div>

      <!-- Tabla de Transacciones -->
      @if (isLoading()) {
        <div class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="table-card glass-card overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Usuario</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Plan</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Monto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Fecha</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Método</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody>
              @if (transactions().length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                    No hay transacciones registradas
                  </td>
                </tr>
              }
              @for (payment of transactions(); track payment.id) {
                <tr class="border-b border-slate-700 hover:bg-slate-700/20 transition-colors">
                  <td class="px-6 py-4 text-sm text-white">{{ payment.user?.email }}</td>
                  <td class="px-6 py-4 text-sm text-slate-300">{{ payment.subscription?.plan?.name }}</td>
                  <td class="px-6 py-4 text-sm text-emerald-400 font-bold">\${{ payment.amount | number: '1.2-2' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-300">{{ payment.payment_date | date: 'short' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-300">{{ payment.payment_method }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span [class]="'status-' + payment.status" class="px-3 py-1 rounded-full text-xs font-bold">
                      {{ formatStatus(payment.status) }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (meta().total > 0) {
          <mat-paginator
            [length]="meta().total"
            [pageSize]="20"
            [pageIndex]="meta().current_page - 1"
            (page)="onPageChange($event)">
          </mat-paginator>
        }
      }
    </div>
  `,
  styles: [`
    .transactions-container { padding: 40px 20px; min-height: 100vh; background: #0f172a; max-width: 1400px; margin: 0 auto; }
    .stat-card { border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; }
    .filters { border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); }
    .search-btn { background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important; color: white !important; }
    .table-card { border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; }
    .status-completed { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .status-pending { background: rgba(249, 115, 22, 0.2); color: #f97316; }
    .status-failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .loading-spinner { display: flex; justify-content: center; padding: 60px 20px; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminTransactionsComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private notification = inject(NotificationService);

  transactions = signal<any[]>([]);
  stats = signal<any>({
    total_revenue: 0,
    total_transactions: 0,
    pending_payments: 0,
    failed_payments: 0,
  });
  meta = signal<any>({
    total: 0,
    current_page: 1,
    last_page: 1,
  });

  isLoading = signal(false);
  search = '';
  statusFilter = '';
  methodFilter = '';

  ngOnInit() {
    this.loadTransactions();
    this.loadStats();
  }

  loadTransactions() {
    this.isLoading.set(true);
    const params: any = {
      per_page: 20,
    };
    if (this.search) params.search = this.search;
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.methodFilter) params.payment_method = this.methodFilter;

    this.subscriptionService.getAdminPayments(params).subscribe({
      next: (response: any) => {
        this.transactions.set(response.data.payments);
        this.meta.set(response.meta);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar transacciones');
        this.isLoading.set(false);
      }
    });
  }

  loadStats() {
    this.subscriptionService.getAdminStats().subscribe({
      next: (response: any) => {
        this.stats.set(response.data);
      },
      error: () => {
        this.notification.error('Error al cargar estadísticas');
      }
    });
  }

  onPageChange(event: PageEvent) {
    window.scrollTo(0, 0);
    this.loadTransactions();
  }

  formatStatus(status: string): string {
    const map: { [key: string]: string } = {
      'completed': 'Completado',
      'pending': 'Pendiente',
      'failed': 'Fallido'
    };
    return map[status] || status;
  }
}
