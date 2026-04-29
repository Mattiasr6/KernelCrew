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
      <h1 class="text-3xl font-bold text-zinc-50 mb-8">Mi Historial de Suscripciones</h1>

      @if (isLoading()) {
        <div class="loading-spinner">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (subscriptions().length === 0) {
        <div class="empty-state glass-card p-8 text-center">
          <span class="material-symbols-outlined text-5xl text-zinc-500 mb-4">shopping_cart_off</span>
          <p class="text-zinc-400 text-lg">Aún no tienes suscripciones.</p>
          <p class="text-zinc-500">¡Elige un plan para acceder a todos los cursos!</p>
        </div>
      } @else {
        <div class="subscriptions-table glass-card overflow-hidden">
          <table class="w-full">
            <thead class="bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Plan</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Inicio</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Fin</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Monto</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-zinc-400">Estado</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-zinc-400">Auto-Renovar</th>
              </tr>
            </thead>
            <tbody>
              @for (sub of subscriptions(); track sub.id) {
                <tr class="border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                  <td class="px-6 py-4 text-sm text-zinc-50 font-semibold">{{ sub.plan.name }}</td>
                  <td class="px-6 py-4 text-sm text-zinc-400">{{ sub.start_date | date: 'short' }}</td>
                  <td class="px-6 py-4 text-sm text-zinc-400">{{ sub.end_date | date: 'short' }}</td>
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
                        (change)="toggleAutoRenew(sub)"
                        color="primary">
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
    .history-container { padding: 40px 20px; min-height: 100vh; background: #09090b; max-width: 1200px; margin: 0 auto; }
    .loading-spinner { display: flex; justify-content: center; padding: 60px 20px; }
    .empty-state { text-align: center; background: #18181b; border: 1px solid #27272a; border-radius: 12px; }
    .subscriptions-table { margin-top: 20px; border-radius: 12px; border: 1px solid #27272a; }
    .glass-card { background: #18181b; }
    .status-active { background: rgba(16, 185, 129, 0.2) !important; color: #10b981 !important; }
    .status-expired { background: rgba(161, 161, 170, 0.2) !important; color: #a1a1aa !important; }
    .status-cancelled { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    ::ng-deep .mat-mdc-slide-toggle.mat-primary {
      --mdc-switch-selected-track-color: #8b5cf6 !important;
      --mdc-switch-selected-handle-color: #fafafa !important;
      --mdc-switch-selected-hover-track-color: #7c3aed !important;
      --mdc-switch-selected-focus-track-color: #8b5cf6 !important;
      --mdc-switch-selected-pressed-track-color: #7c3aed !important;
    }
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