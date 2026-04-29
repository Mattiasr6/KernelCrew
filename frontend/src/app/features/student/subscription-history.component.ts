import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../core/services/subscription.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-subscription-history',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="history-container animate-fade-in">
      <h1 class="text-3xl font-bold text-white mb-8">Mi Historial de Suscripciones</h1>

      @if (isLoading()) {
        <div class="loading-spinner">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (subscriptions().length === 0) {
        <div class="empty-state glass-card p-8 text-center">
          <span class="material-symbols-outlined text-5xl text-slate-400 mb-4">shopping_cart_off</span>
          <p class="text-slate-400 text-lg">Aún no tienes suscripciones.</p>
          <p class="text-slate-500">¡Elige un plan para acceder a todos los cursos!</p>
        </div>
      } @else {
        <div class="subscriptions-table glass-card overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Plan</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Inicio</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Fin</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Monto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-slate-300">Estado</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-slate-300">Auto-Renovar</th>
              </tr>
            </thead>
            <tbody>
              @for (sub of subscriptions(); track sub.id) {
                <tr class="border-b border-slate-700 hover:bg-slate-700/20 transition-colors">
                  <td class="px-6 py-4 text-sm text-white font-semibold">{{ sub.plan.name }}</td>
                  <td class="px-6 py-4 text-sm text-slate-300">{{ sub.start_date | date: 'short' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-300">{{ sub.end_date | date: 'short' }}</td>
                  <td class="px-6 py-4 text-sm text-emerald-400 font-bold">\${{ sub.plan.price / 100 | number: '1.2-2' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <mat-chip [class]="'status-' + sub.status">
                      {{ formatStatus(sub.status) }}
                    </mat-chip>
                  </td>
                  <td class="px-6 py-4 text-center">
                    @if (sub.status === 'active') {
                      <mat-slide-toggle 
                        [checked]="sub.auto_renew"
                        (change)="toggleAutoRenew(sub)">
                      </mat-slide-toggle>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container { padding: 40px 20px; min-height: 100vh; background: #0f172a; max-width: 1200px; margin: 0 auto; }
    .loading-spinner { display: flex; justify-content: center; padding: 60px 20px; }
    .empty-state { text-align: center; }
    .subscriptions-table { margin-top: 20px; border-radius: 12px; }
    .status-active { background: rgba(16, 185, 129, 0.2) !important; color: #10b981 !important; }
    .status-expired { background: rgba(148, 163, 184, 0.2) !important; color: #cbd5e1 !important; }
    .status-cancelled { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class SubscriptionHistoryComponent implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private notification = inject(NotificationService);

  subscriptions = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.subscriptionService.getHistory().subscribe({
      next: (response: any) => {
        this.subscriptions.set(response.data.subscriptions);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el historial');
        this.isLoading.set(false);
      }
    });
  }

  toggleAutoRenew(subscription: any) {
    this.subscriptionService.updateAutoRenew(subscription.id, !subscription.auto_renew)
      .subscribe({
        next: () => {
          subscription.auto_renew = !subscription.auto_renew;
          this.notification.success('Auto-renovación actualizada');
        },
        error: () => {
          this.notification.error('Error al actualizar auto-renovación');
        }
      });
  }

  formatStatus(status: string): string {
    const map: { [key: string]: string } = {
      'active': 'Activa',
      'expired': 'Vencida',
      'cancelled': 'Cancelada'
    };
    return map[status] || status;
  }
}
